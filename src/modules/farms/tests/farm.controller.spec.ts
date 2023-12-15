import config from "config/config";
import { Express } from "express";
import { v4 as uuidv4 } from "uuid";
import { setupServer } from "server/server";
import { clearDatabase, disconnectAndClearDatabase } from "helpers/utils";
import http, { Server } from "http";
import ds from "orm/orm.config";
import supertest, { SuperAgentTest } from "supertest";
import { CreateFarmDto } from "../dto/create-farm.dto";
import { CreateUserDto } from "../../users/dto/create-user.dto";
import { UsersService } from "../../users/users.service";
import { UpdateUserLocationDataDto } from "modules/users/dto/update-userLocationData.dto";
import { GetFarmDto } from "../dto/get-farms.dto";

describe("FarmsController", () => {
  let app: Express;
  let agent: SuperAgentTest;
  let server: Server;

  let usersService: UsersService;
  const createFarmDto: CreateFarmDto = {
    name: "Farm 1",
    address: "Farm 1 address",
    coordinates: "55.67087112646539, 12.582277381808696",
    size: 100.3,
    userId: "",
    yield: 90.4,
  };
  const createUserDto: CreateUserDto = { email: "user@test.com", password: "password" };

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

    agent = supertest.agent(app);
    usersService = new UsersService();
  });

  describe("POST /farm", () => {
    const createUser = async (userDto: CreateUserDto) => usersService.createUser(userDto);

    it("should create new farm", async () => {
      const user = await createUser(createUserDto);

      createFarmDto.userId = user.id;
      const res = await agent.post("/api/farms").send(createFarmDto);

      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({
        id: expect.any(String),
        name: expect.stringContaining(createFarmDto.name) as string,
        address: expect.stringContaining(createFarmDto.address) as string,
        coordinates: expect.stringContaining(createFarmDto.coordinates) as string,
        size: expect.any(Number),
        yield: expect.any(Number),
        userId: expect.stringContaining(user.id) as string,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });

  describe("GET /farms", () => {
    const updateUserLocationDto: UpdateUserLocationDataDto = {
      address: "test address",
      coordinates: "52.670925580780214, 10.582320297150432",
    };

    const createUser = async (userDto: CreateUserDto) => usersService.createUser(userDto);
    const updateUserLocationData = async (user: string, updateUserLocationDto: UpdateUserLocationDataDto) =>
      usersService.updateUserLocation(user, updateUserLocationDto);

    it("should get farms", async () => {
      const user = await createUser(createUserDto);
      await updateUserLocationData(user.id, updateUserLocationDto);

      createFarmDto.userId = user.id;
      await agent.post("/api/farms").send(createFarmDto);

      const res = await agent.get("/api/farms").query({ userId: user.id });
      const farms = res.body as GetFarmDto[];

      expect(res.statusCode).toBe(200);
      expect(farms).toBeDefined();
      expect(farms.length).toBe(1);
      expect(farms[0]).toMatchObject({
        id: expect.any(String),
        name: expect.stringContaining(createFarmDto.name) as string,
        address: expect.stringContaining(createFarmDto.address) as string,
        owner: expect.stringContaining(user.email) as string,
        size: expect.any(Number),
        yield: expect.any(Number),
        drivingDistance: expect.any(Number),
        createdAt: expect.any(String),
      });
    });

    it("should get an empty array if no farms", async () => {
      const user = await createUser(createUserDto);
      await updateUserLocationData(user.id, updateUserLocationDto);

      const res = await agent.get("/api/farms").query({ userId: user.id });
      const farms = res.body as GetFarmDto[];

      expect(res.statusCode).toBe(200);
      expect(farms).toBeDefined();
      expect(farms.length).toBe(0);
    });

    it("should throw UnprocessableEntityError when trying to get a user that does not exist try to get farms", async () => {
      const res = await agent.get("/api/farms").query({ userId: uuidv4() });

      expect(res.statusCode).toBe(422);
      expect(res.body).toMatchObject({
        name: "UnprocessableEntityError",
        message: "User with the id does not exists",
      });
    });

    it("should throw UnprocessableEntityError when get farms as user that does not have location data", async () => {
      const user = await createUser(createUserDto);

      const res = await agent.get("/api/farms").query({ userId: user.id });

      expect(res.statusCode).toBe(422);
      expect(res.body).toMatchObject({
        name: "UnprocessableEntityError",
        message: "User coordinates are not set",
      });
    });
  });
});
