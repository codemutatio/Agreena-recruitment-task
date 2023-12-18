import { Repository } from "typeorm";
import { faker } from "@faker-js/faker";
import dataSource from "orm/orm.config";
import { User } from "../entities/user.entity";

export class UserSeedFactory {
  private readonly usersRepository: Repository<User>;

  constructor() {
    this.usersRepository = dataSource.getRepository(User);
  }

  public async createMany(quantity: number) {
    const users = faker.helpers.multiple(this.createRandomUser, {
      count: quantity,
    });

    await this.usersRepository.insert(users);

    return users;
  }

  private createRandomUser() {
    return {
      id: faker.string.uuid(),
      address: faker.location.streetAddress(),
      coordinates: `(${faker.location.latitude({
        min: 54.57,
        max: 55.75,
        precision: 8,
      })}, ${faker.location.longitude({
        min: 10.07,
        max: 11.13,
        precision: 8,
      })})`,
      email: faker.internet.email(),
      hashedPassword: faker.internet.password(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    };
  }
}
