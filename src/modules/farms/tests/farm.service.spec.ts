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
import { UnprocessableEntityError } from "errors/errors";

describe("FarmsService", () => {
  let app: Express;
  let server: Server;

  let farmsService: FarmsService;
  let usersService: UsersService;
  const createUserDto: CreateUserDto = { email: "user@test.com", password: "password" };
  const createFarm1Dto: CreateFarmDto = {
    name: "Farm 1",
    address: "Rebildvej 30",
    size: 100,
    yield: 85.2,
  };
  const createFarm2Dto: CreateFarmDto = {
    name: "Farm 2",
    address: "Fælled Alle 9",
    size: 80,
    yield: 45.76,
  };
  const createFarm3Dto: CreateFarmDto = {
    name: "Farm 3",
    address: "Martin Reimers Vej 10",
    size: 350.6,
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

      const createdFarm = await farmsService.createFarm(createdUser.id, createFarm1Dto);
      expect(createdFarm).toBeInstanceOf(Farm);
      expect(createdFarm.coordinates).toBeDefined();
    });

    it("should throw UnprocessableEntityError if address is invalid", async () => {
      const createdUser = await usersService.createUser(createUserDto);

      await farmsService
        .createFarm(createdUser.id, { ...createFarm1Dto, address: "invalid address" })
        .catch((error: UnprocessableEntityError) => {
          expect(error).toBeInstanceOf(UnprocessableEntityError);
          expect(error.message).toBe("Invalid address");
        });
    });
  });

  describe(".getFarms", () => {
    const updateUserLocationDto: UpdateUserLocationDataDto = {
      address: "Nørrebro, Copenhagen, Denmark",
    };

    it("should fetch farms with enhanced properties and transformed to GetFarmDto", async () => {
      const createdUser = await usersService.createUser(createUserDto);
      const [updatedUser] = await Promise.all([
        usersService.updateUserLocation(createdUser.id, updateUserLocationDto),
        farmsService.createFarm(createdUser.id, createFarm1Dto),
        farmsService.createFarm(createdUser.id, createFarm2Dto),
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
      const [updatedUser] = await Promise.all([
        usersService.updateUserLocation(createdUser.id, updateUserLocationDto),
        farmsService.createFarm(createdUser.id, createFarm1Dto),
        farmsService.createFarm(createdUser.id, createFarm2Dto),
        farmsService.createFarm(createdUser.id, createFarm3Dto),
      ]);

      const getFarmsQueryDto: GetFarmsQueryDto = plainToClass(GetFarmsQueryDto, {
        sortBy: SortBy.DISTANCE,
      });

      const farms = await farmsService.getFarms(updatedUser, getFarmsQueryDto);
      expect(farms[0].name).toBe(createFarm1Dto.name);
      expect(farms[0].drivingDistance).toBeDefined();
    });

    it("should filter by outliers set to false", async () => {
      const createdUser = await usersService.createUser(createUserDto);
      const [updatedUser] = await Promise.all([
        usersService.updateUserLocation(createdUser.id, updateUserLocationDto),
        farmsService.createFarm(createdUser.id, createFarm1Dto),
        farmsService.createFarm(createdUser.id, createFarm2Dto),
        farmsService.createFarm(createdUser.id, createFarm3Dto),
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
      const [updatedUser] = await Promise.all([
        usersService.updateUserLocation(createdUser.id, updateUserLocationDto),
        farmsService.createFarm(createdUser.id, createFarm1Dto),
        farmsService.createFarm(createdUser.id, createFarm2Dto),
        farmsService.createFarm(createdUser.id, createFarm3Dto),
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
