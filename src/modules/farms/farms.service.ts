import { Repository } from "typeorm";
import { CreateFarmDto } from "./dto/create-farm.dto";
import { Farm } from "./entities/farm.entity";
import dataSource from "orm/orm.config";

export class FarmsService {
  private readonly farmsRepository: Repository<Farm>;

  constructor() {
    this.farmsRepository = dataSource.getRepository(Farm);
  }

  public async createFarm(data: CreateFarmDto): Promise<Farm> {
    const { coordinates, ...otherFarmCreationData } = data;

    const newFarm = this.farmsRepository.create({ ...otherFarmCreationData, coordinates: `(${coordinates})` });
    return this.farmsRepository.save(newFarm);
  }
}
