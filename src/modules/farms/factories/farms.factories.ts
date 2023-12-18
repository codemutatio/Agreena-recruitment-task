import { Repository } from "typeorm";
import { faker } from "@faker-js/faker";
import dataSource from "orm/orm.config";
import { Farm } from "../entities/farm.entity";
import { User } from "modules/users/entities/user.entity";

export class FarmSeedFactory {
  private readonly farmsRepository: Repository<Farm>;

  constructor() {
    this.farmsRepository = dataSource.getRepository(Farm);
  }

  public async createMany({ quantity, users }: { quantity: number; users: User[] }) {
    for (const user of users) {
      const farms = faker.helpers.multiple(this.createRandomFarm, {
        count: quantity,
      });

      await this.farmsRepository.insert(farms.map(farm => ({ ...farm, userId: user.id })));
    }
  }

  private createRandomFarm() {
    return {
      id: faker.string.uuid(),
      address: faker.location.streetAddress(),
      coordinates: `(${faker.location.latitude({
        min: 54.57,
        max: 56.75,
        precision: 8,
      })}, ${faker.location.longitude({
        min: 8.07,
        max: 11.13,
        precision: 8,
      })})`,
      name: faker.company.name(),
      size: faker.number.float({
        min: 45,
        max: 500,
        precision: 2,
      }),
      yield: faker.number.float({
        min: 45,
        max: 400,
        precision: 2,
      }),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    };
  }
}
