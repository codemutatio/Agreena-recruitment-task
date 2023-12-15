import { Repository } from "typeorm";
import { Client, TravelMode } from "@googlemaps/google-maps-services-js";
import config from "config/config";
import dataSource from "orm/orm.config";
import { UsersService } from "modules/users/users.service";
import { CreateFarmDto } from "./dto/create-farm.dto";
import { Farm } from "./entities/farm.entity";
import { FilterBy, GetFarmsQueryDto, SortBy, SortOrder } from "./dto/get-farmsQuery.dto";
import { UnprocessableEntityError } from "errors/errors";
import { plainToClass } from "class-transformer";
import { GetFarmDto } from "./dto/get-farms.dto";

export class FarmsService {
  private readonly farmsRepository: Repository<Farm>;
  private readonly usersService: UsersService;
  private readonly client: Client;

  constructor() {
    this.farmsRepository = dataSource.getRepository(Farm);
    this.usersService = new UsersService();
    this.client = new Client({});
  }

  public async createFarm(data: CreateFarmDto): Promise<Farm> {
    const { coordinates, ...otherFarmCreationData } = data;

    const newFarm = this.farmsRepository.create({ ...otherFarmCreationData, coordinates: `(${coordinates})` });
    return this.farmsRepository.save(newFarm);
  }

  public async getAverageYield(): Promise<number> {
    const averageResult = (await this.farmsRepository
      .createQueryBuilder("farm")
      .select("ROUND(AVG(farm.yield)::numeric, 2)", "averageYield")
      .getRawOne()) as { averageYield: string };

    return +averageResult.averageYield;
  }

  public async getFarms(data: GetFarmsQueryDto): Promise<GetFarmDto[]> {
    const currentUser = await this.usersService.findOneBy({ id: data.userId });

    if (!currentUser) throw new UnprocessableEntityError("User with the id does not exists");
    if (!currentUser.coordinates) throw new UnprocessableEntityError("User coordinates are not set");

    const currentUserCoordinates = this.convertCoordinatesToString(currentUser.coordinates);

    const query = await this.buildGetFarmsQuery(`(${currentUserCoordinates})`, data);
    const farms = await query.getMany();

    if (!farms.length) return [];

    const farmsCoordinates = this.getFarmCoordinates(farms);
    const farmDistancesFromUser = await this.getDrivingDistance({
      origin: currentUserCoordinates,
      destinations: farmsCoordinates,
    });

    let enhancedFarms = this.enhanceAndTransformFarms({ farms, drivingDistances: farmDistancesFromUser });

    if (data.sortBy === SortBy.DISTANCE) {
      enhancedFarms = this.sortFarms({ farms: enhancedFarms, sortOrder: data.sortOrder });
    }

    return enhancedFarms;
  }

  private async buildGetFarmsQuery(userCoordinates: string, data: GetFarmsQueryDto) {
    const { filterBy, filterValue, page, size, sortBy, sortOrder } = data;
    let query = this.farmsRepository
      .createQueryBuilder("farm")
      .leftJoinAndSelect("farm.user", "user")
      .select([
        "farm.id",
        "farm.name",
        "farm.address",
        "farm.size",
        "farm.yield",
        "farm.createdAt",
        "farm.coordinates",
        "user.email",
      ])
      .skip((page - 1) * size)
      .take(size);

    if (filterBy === FilterBy.OUTLIERS) {
      const averageYield = await this.getAverageYield();
      const yieldLowerBound = averageYield * 0.7;
      const yieldUpperBound = averageYield * 1.3;

      if (filterValue) {
        query = query.andWhere("farm.yield < :yieldLowerBound OR farm.yield > :yieldUpperBound", {
          yieldLowerBound,
          yieldUpperBound,
        });
      } else {
        query = query.andWhere("farm.yield BETWEEN :yieldLowerBound AND :yieldUpperBound", { yieldLowerBound, yieldUpperBound });
      }
    }

    // Distance calculation and sorting if needed
    if (sortBy === SortBy.DISTANCE) {
      query = query
        .addSelect(`farm.coordinates <-> point '${userCoordinates}'`, `${sortBy}`)
        .orderBy(`${sortBy}`, `${sortOrder}`);
    } else {
      query = query.orderBy(`farm.${sortBy}`, `${sortOrder}`);
    }

    return query;
  }

  private convertCoordinatesToString(coordinates: string | { x: number; y: number }) {
    return typeof coordinates !== "string" ? `${coordinates.x}, ${coordinates.y}` : coordinates;
  }

  private getFarmCoordinates(farms: Farm[]) {
    return farms.map(farm => this.convertCoordinatesToString(farm.coordinates));
  }

  private async getDrivingDistance({ origin, destinations }: { origin: string; destinations: string[] }) {
    const response = await this.client.distancematrix({
      params: {
        origins: [origin],
        destinations,
        key: config.GOOGLE_MAPS_API_KEY,
        mode: TravelMode.driving,
      },
      timeout: 1000,
    });

    // This returns the distance in meters, so we divide by 1000 to get the distance in kilometers
    return response.data.rows[0].elements.map(element => (element.distance.value || 0) / 1000);
  }
  private enhanceAndTransformFarms({ farms, drivingDistances }: { farms: Farm[]; drivingDistances: number[] }): GetFarmDto[] {
    return farms.map((farm, index) => {
      const drivingDistance = drivingDistances[index];

      const { user, ...otherFarmProperties } = farm;

      return plainToClass(
        GetFarmDto,
        { ...otherFarmProperties, drivingDistance, owner: user.email },
        { excludeExtraneousValues: true },
      );
    });
  }

  private sortFarms({ farms, sortOrder }: { farms: GetFarmDto[]; sortOrder: SortOrder }): GetFarmDto[] {
    return farms.sort((a, b) =>
      sortOrder === SortOrder.ASC ? a.drivingDistance - b.drivingDistance : b.drivingDistance - a.drivingDistance,
    );
  }
}
