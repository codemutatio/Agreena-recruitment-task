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
    const existingUsers = await this.usersRepository.count();

    if (!existingUsers) {
      const users = faker.helpers.multiple(this.createRandomUser, {
        count: quantity,
      });

      await this.usersRepository.insert(users);
    }
  }

  private createRandomUser() {
    return {
      id: faker.string.uuid(),
      address: faker.location.streetAddress(),
      coordinates: `(${faker.location.latitude({
        min: 35,
        max: 71,
        precision: 8,
      })}, ${faker.location.longitude({
        min: -25,
        max: 40,
        precision: 8,
      })})`,
      email: faker.internet.email(),
      hashedPassword: faker.internet.password(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    };
  }
}
