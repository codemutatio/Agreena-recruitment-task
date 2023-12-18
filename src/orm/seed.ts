import dataSource from "orm/orm.config";
import { FarmSeedFactory } from "modules/farms/factories/farms.factories";
import { UserSeedFactory } from "modules/users/factories/users.factories";
import { User } from "modules/users/entities/user.entity";

async function runSeeds() {
  await dataSource.initialize();

  const usersFactory = new UserSeedFactory();
  const farmsFactory = new FarmSeedFactory();

  const users = (await usersFactory.createMany(5)) as User[];
  await farmsFactory.createMany({
    quantity: 50,
    users,
  });

  await dataSource.destroy();
}

runSeeds().then(() => console.log("Seeding completed."));
