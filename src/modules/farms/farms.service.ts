import { Repository } from "typeorm";
import config from "config/config";
import dataSource from "orm/orm.config";
import { CreateFarmDto } from "./dto/create-farm.dto";
import { Farm } from "./entities/farm.entity";
import { FilterBy, GetFarmsQueryDto, SortBy, SortOrder } from "./dto/get-farmsQuery.dto";
import { UnprocessableEntityError } from "errors/errors";
import { plainToClass } from "class-transformer";
import { GetFarmDto } from "./dto/get-farms.dto";
import { User } from "modules/users/entities/user.entity";
import { DistanceMatrixAPI } from "providers/googleMaps.provider";

export class FarmsService {
  private readonly farmsRepository: Repository<Farm>;
  private readonly distanceMatrixAPI: DistanceMatrixAPI;

  constructor() {
    this.farmsRepository = dataSource.getRepository(Farm);
    this.distanceMatrixAPI = new DistanceMatrixAPI({ apiKey: config.GOOGLE_MAPS_API_KEY, maxDestinationsPerBatch: 25 });
  }

  public async createFarm(userId: string, data: CreateFarmDto): Promise<Farm> {
    const newFarm = this.farmsRepository.create({ ...data, userId });

    return this.farmsRepository.save(newFarm);
  }

  public async getFarms(user: User, data: GetFarmsQueryDto): Promise<GetFarmDto[]> {
    if (!user.coordinates) throw new UnprocessableEntityError("User coordinates are not set");

    const query = await this.buildGetFarmsQuery(`(${user.coordinates})`, data);
    const farms = await query.getMany();

    if (!farms.length) return [];

    const farmsCoordinates = farms.map(farm => farm.coordinates);
    const farmDistancesFromUser = await this.distanceMatrixAPI.getDrivingDistance({
      origins: [user.coordinates],
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
        "farm.userId",
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

  private async getAverageYield(): Promise<number> {
    const averageResult = (await this.farmsRepository
      .createQueryBuilder("farm")
      .select("ROUND(AVG(farm.yield)::numeric, 2)", "averageYield")
      .getRawOne()) as { averageYield: string };

    return +averageResult.averageYield;
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
