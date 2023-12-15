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
import { GetFarmsQueryDto } from "../dto/get-farmsQuery.dto";
import { plainToClass } from "class-transformer";
import { GetFarmDto } from "../dto/get-farms.dto";
import { UpdateUserLocationDataDto } from "modules/users/dto/update-userLocationData.dto";

describe("FarmsService", () => {
  let app: Express;
  let server: Server;

  let farmsService: FarmsService;
  let usersService: UsersService;
  const createUserDto: CreateUserDto = { email: "user@test.com", password: "password" };
  const createFarm1Dto: CreateFarmDto = {
    name: "Farm 1",
    address: "Farm 1 address",
    coordinates: "55.67087112646539, 12.582277381808696",
    size: 100,
    userId: "",
    yield: 85.2,
  };
  const createFarm2Dto: CreateFarmDto = {
    name: "Farm 2",
    address: "Farm 3 address",
    coordinates: "53.67087112646539, 12.582277381808696",
    size: 80,
    userId: "",
    yield: 45.76,
  };

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
    it("should create new farm", async () => {
      const createdUser = await usersService.createUser(createUserDto);

      createFarm1Dto.userId = createdUser.id;
      const createdFarm = await farmsService.createFarm(createFarm1Dto);
      expect(createdFarm).toBeInstanceOf(Farm);
    });
  });

  describe(".getAverageYield", () => {
    it("should get average yield of farma", async () => {
      const createdUser = await usersService.createUser(createUserDto);

      createFarm1Dto.userId = createdUser.id;
      createFarm2Dto.userId = createdUser.id;
      await Promise.all([farmsService.createFarm(createFarm1Dto), farmsService.createFarm(createFarm2Dto)]);
      const averageYield = await farmsService.getAverageYield();

      expect(typeof averageYield).toBe("number");
      expect(averageYield).toBe((createFarm1Dto.yield + createFarm2Dto.yield) / 2);
    });
  });

  describe(".getFarms", () => {
    const updateUserLocationDto: UpdateUserLocationDataDto = {
      address: "test address",
      coordinates: "52.670925580780214, 10.582320297150432",
    };

    it("should fetch farms with enhanced properties and transformed to GetFarmDto", async () => {
      const createdUser = await usersService.createUser(createUserDto);
      createFarm1Dto.userId = createdUser.id;
      createFarm2Dto.userId = createdUser.id;
      await Promise.all([
        farmsService.createFarm(createFarm1Dto),
        farmsService.createFarm(createFarm2Dto),
        usersService.updateUserLocation(createdUser.id, updateUserLocationDto),
      ]);

      // Create a GetFarmsQueryDto object
      const getFarmsQueryDto: GetFarmsQueryDto = plainToClass(GetFarmsQueryDto, { userId: createdUser.id });

      const farms = await farmsService.getFarms(getFarmsQueryDto);
      expect(farms.length).toBeGreaterThan(0);
      expect(farms[0]).toBeInstanceOf(GetFarmDto);
      expect(farms[0]).toHaveProperty("drivingDistance");
    });

    it("should return empty array if no farms found", async () => {
      const createdUser = await usersService.createUser(createUserDto);
      await usersService.updateUserLocation(createdUser.id, updateUserLocationDto);

      // Create a GetFarmsQueryDto object
      const getFarmsQueryDto: GetFarmsQueryDto = plainToClass(GetFarmsQueryDto, { userId: createdUser.id });

      const farms = await farmsService.getFarms(getFarmsQueryDto);
      expect(farms).toBeDefined();
      expect(farms.length).toBe(0);
    });
  });
});
