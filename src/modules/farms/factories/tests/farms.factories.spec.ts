import { Express } from "express";
import http, { Server } from "http";
import ds from "orm/orm.config";
import config from "config/config";
import { FarmSeedFactory } from "../farms.factories";
import { clearDatabase, disconnectAndClearDatabase } from "helpers/utils";
import { Repository } from "typeorm";
import { Farm } from "modules/farms/entities/farm.entity";
import { UserSeedFactory } from "modules/users/factories/users.factories";

describe("FarmSeedFactory", () => {
  let app: Express;
  let server: Server;

  let farmSeedFactory: FarmSeedFactory;
  let userSeedFactory: UserSeedFactory;
  let farmsRepository: Repository<Farm>;

  beforeAll(async () => {
    await ds.initialize();

    server = http.createServer(app).listen(config.APP_PORT);
  });

  afterAll(async () => {
    await disconnectAndClearDatabase(ds);

    server.close();
  });

  beforeEach(async () => {
    await clearDatabase(ds);

    userSeedFactory = new UserSeedFactory();
    farmSeedFactory = new FarmSeedFactory();
    farmsRepository = ds.getRepository(Farm);
  });

  it("should create n amount of farms per user", async () => {
    await userSeedFactory.createMany(10);
    await farmSeedFactory.createMany(30);

    const farms = await farmsRepository.find();

    expect(farms.length).toBe(300);
    expect(farms[0]).toBeInstanceOf(Farm);
  });

  it("should not create farms if they already exist", async () => {
    await userSeedFactory.createMany(10);
    await farmSeedFactory.createMany(30);
    await farmSeedFactory.createMany(30);

    const farms = await farmsRepository.find();

    expect(farms.length).toBe(300);
  });
});
