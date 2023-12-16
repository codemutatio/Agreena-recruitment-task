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
import { FilterBy, GetFarmsQueryDto, SortBy, SortOrder } from "../dto/get-farmsQuery.dto";
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
  const createFarm3Dto: CreateFarmDto = {
    name: "Farm 3",
    address: "Farm 3 address",
    coordinates: "52.71087112646539, 10.622277381808696",
    size: 350.6,
    userId: "",
    yield: 180.5,
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

  describe(".getFarms", () => {
    const updateUserLocationDto: UpdateUserLocationDataDto = {
      address: "test address",
      coordinates: "52.670925580780214, 10.582320297150432",
    };

    it("should fetch farms with enhanced properties and transformed to GetFarmDto", async () => {
      const createdUser = await usersService.createUser(createUserDto);
      createFarm1Dto.userId = createdUser.id;
      createFarm2Dto.userId = createdUser.id;
      const [updatedUser] = await Promise.all([
        usersService.updateUserLocation(createdUser.id, updateUserLocationDto),
        farmsService.createFarm(createFarm1Dto),
        farmsService.createFarm(createFarm2Dto),
      ]);

      // Create a GetFarmsQueryDto object
      const getFarmsQueryDto: GetFarmsQueryDto = plainToClass(GetFarmsQueryDto, {});

      const farms = await farmsService.getFarms(updatedUser, getFarmsQueryDto);
      expect(farms.length).toBeGreaterThan(0);
      expect(farms[0]).toBeInstanceOf(GetFarmDto);
      expect(farms[0]).toHaveProperty("drivingDistance");
    });

    it("should return empty array if no farms found", async () => {
      const createdUser = await usersService.createUser(createUserDto);
      const updatedUser = await usersService.updateUserLocation(createdUser.id, updateUserLocationDto);

      const getFarmsQueryDto: GetFarmsQueryDto = plainToClass(GetFarmsQueryDto, {});

      const farms = await farmsService.getFarms(updatedUser, getFarmsQueryDto);
      expect(farms).toBeDefined();
      expect(farms.length).toBe(0);
    });

    it("should sort farms by distance", async () => {
      const createdUser = await usersService.createUser(createUserDto);
      createFarm1Dto.userId = createdUser.id;
      createFarm2Dto.userId = createdUser.id;
      createFarm3Dto.userId = createdUser.id;
      const [updatedUser] = await Promise.all([
        usersService.updateUserLocation(createdUser.id, updateUserLocationDto),
        farmsService.createFarm(createFarm1Dto),
        farmsService.createFarm(createFarm2Dto),
        farmsService.createFarm(createFarm3Dto),
      ]);

      const getFarmsQueryDto: GetFarmsQueryDto = plainToClass(GetFarmsQueryDto, {
        sortBy: SortBy.DISTANCE,
      });

      const farms = await farmsService.getFarms(updatedUser, getFarmsQueryDto);
      expect(farms[0].name).toBe(createFarm3Dto.name);
      expect(farms[0].drivingDistance).toBeDefined();
    });

    it("should filter by outliers set to false", async () => {
      const createdUser = await usersService.createUser(createUserDto);
      createFarm1Dto.userId = createdUser.id;
      createFarm2Dto.userId = createdUser.id;
      createFarm3Dto.userId = createdUser.id;
      const [updatedUser] = await Promise.all([
        usersService.updateUserLocation(createdUser.id, updateUserLocationDto),
        farmsService.createFarm(createFarm1Dto),
        farmsService.createFarm(createFarm2Dto),
        farmsService.createFarm(createFarm3Dto),
      ]);

      const getFarmsQueryDto: GetFarmsQueryDto = plainToClass(GetFarmsQueryDto, {
        sortBy: SortBy.DISTANCE,
        filterBy: FilterBy.OUTLIERS,
        filterValue: "false",
      });

      const farms = await farmsService.getFarms(updatedUser, getFarmsQueryDto);
      expect(farms.length).toBe(1);
    });

    it("should filter by outliers set to true", async () => {
      const createdUser = await usersService.createUser(createUserDto);
      createFarm1Dto.userId = createdUser.id;
      createFarm2Dto.userId = createdUser.id;
      createFarm3Dto.userId = createdUser.id;
      const [updatedUser] = await Promise.all([
        usersService.updateUserLocation(createdUser.id, updateUserLocationDto),
        farmsService.createFarm(createFarm1Dto),
        farmsService.createFarm(createFarm2Dto),
        farmsService.createFarm(createFarm3Dto),
      ]);

      const getFarmsQueryDto: GetFarmsQueryDto = plainToClass(GetFarmsQueryDto, {
        sortBy: SortBy.DISTANCE,
        sortOrder: SortOrder.DESC,
        filterBy: FilterBy.OUTLIERS,
        filterValue: "true",
      });

      const farms = await farmsService.getFarms(updatedUser, getFarmsQueryDto);
      expect(farms.length).toBe(2);
    });
  });
});
