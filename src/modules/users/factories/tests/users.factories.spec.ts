import { Express } from "express";
import http, { Server } from "http";
import ds from "orm/orm.config";
import config from "config/config";
import { UserSeedFactory } from "../users.factories";
import { clearDatabase, disconnectAndClearDatabase } from "helpers/utils";
import { User } from "modules/users/entities/user.entity";
import { Repository } from "typeorm";

describe("UserSeedFactory", () => {
  let app: Express;
  let server: Server;

  let userSeedFactory: UserSeedFactory;
  let usersRepository: Repository<User>;

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
    usersRepository = ds.getRepository(User);
  });

  it("should create n amount of users", async () => {
    await userSeedFactory.createMany(10);

    const users = await usersRepository.find();

    expect(users.length).toBe(10);
    expect(users[0]).toBeInstanceOf(User);
  });
});
