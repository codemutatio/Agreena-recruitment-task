import config from "config/config";
import { Express } from "express";
import { setupServer } from "server/server";
import { clearDatabase, disconnectAndClearDatabase } from "helpers/utils";
import http, { Server } from "http";
import ds from "orm/orm.config";
import { CreateFarmDto } from "../dto/create-farm.dto";
import { Farm } from "../entities/farm.entity";
import { FarmsService } from "../farms.service";
import { CreateUserDto } from "../../users/dto/create-user.dto";
import { UsersService } from "../../users/users.service";

describe("FarmsService", () => {
  let app: Express;
  let server: Server;

  let farmsService: FarmsService;
  let usersService: UsersService;

  beforeAll(async () => {
    app = setupServer();
    await ds.initialize();

    server = http.createServer(app).listen(config.APP_PORT);
  });

  afterAll(async () => {
    await disconnectAndClearDatabase(ds);
    server.close();
  });

  beforeEach(async () => {
    await clearDatabase(ds);

    farmsService = new FarmsService();
    usersService = new UsersService();
  });

  describe(".createFarm", () => {
    const createUserDto: CreateUserDto = { email: "user@test.com", password: "password" };
    const createFarmDto: CreateFarmDto = {
      name: "Farm 1",
      address: "Farm 1 address",
      coordinates: "55.67087112646539, 12.582277381808696",
      size: 100,
      userId: "",
      yield: 100,
    };

    it("should create new farm", async () => {
      const createdUser = await usersService.createUser(createUserDto);

      createFarmDto.userId = createdUser.id;
      const createdFarm = await farmsService.createFarm(createFarmDto);
      expect(createdFarm).toBeInstanceOf(Farm);
    });
  });
});
