import dataSource from "orm/orm.config";
import { FarmSeedFactory } from "modules/farms/factories/farms.factories";
import { UserSeedFactory } from "modules/users/factories/users.factories";

async function runSeeds() {
  await dataSource.initialize();

  const userFactory = new UserSeedFactory();
  const farmsFactory = new FarmSeedFactory();

  await userFactory.createMany(5);
  await farmsFactory.createMany(50);

  await dataSource.destroy();
}

runSeeds().then(() => console.log("Seeding completed."));
