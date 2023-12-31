import config from "config/config";
import { Express } from "express";
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
import { AuthService } from "modules/auth/auth.service";
import { FarmsService } from "../farms.service";

describe("FarmsController", () => {
  let app: Express;
  let agent: SuperAgentTest;
  let server: Server;

  let authService: AuthService;
  let farmsService: FarmsService;
  let usersService: UsersService;
  const createFarmDto: CreateFarmDto = {
    name: "Farm 1",
    address: "Rebildvej 30",
    size: 100.3,
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
    authService = new AuthService();
    farmsService = new FarmsService();
    usersService = new UsersService();
  });

  describe("POST /farm", () => {
    const createUser = async (userDto: CreateUserDto) => usersService.createUser(userDto);
    const loginUser = async (userDto: CreateUserDto) => authService.login(userDto);

    it("should create new farm", async () => {
      const user = await createUser(createUserDto);
      const { token } = await loginUser(createUserDto);

      const res = await agent.post("/api/farms").set("Authorization", `Bearer ${token}`).send(createFarmDto);

      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({
        id: expect.any(String),
        name: expect.stringContaining(createFarmDto.name) as string,
        address: expect.stringContaining(createFarmDto.address) as string,
        coordinates: expect.any(String),
        size: expect.any(Number),
        yield: expect.any(Number),
        userId: expect.stringContaining(user.id) as string,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it("should throw UnprocessableEntityError if address is invalid", async () => {
      await createUser(createUserDto);
      const { token } = await loginUser(createUserDto);

      await agent
        .post("/api/farms")
        .set("Authorization", `Bearer ${token}`)
        .send({ ...createFarmDto, address: "invalid address" })
        .catch((error: Error) => {
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toBe("Unprocessable Entity");
        });
    });
  });

  describe("GET /farms", () => {
    const updateUserLocationDto: UpdateUserLocationDataDto = {
      address: "Nørrebro, Copenhagen, Denmark",
    };

    const createFarm = async (userId: string, farmDto: CreateFarmDto) => farmsService.createFarm(userId, farmDto);
    const createUser = async (userDto: CreateUserDto) => usersService.createUser(userDto);
    const loginUser = async (userDto: CreateUserDto) => authService.login(userDto);
    const updateUserLocationData = async (user: string, updateUserLocationDto: UpdateUserLocationDataDto) =>
      usersService.updateUserLocation(user, updateUserLocationDto);

    it("should get farms", async () => {
      const user = await createUser(createUserDto);
      const { token } = await loginUser(createUserDto);
      await updateUserLocationData(user.id, updateUserLocationDto);

      await createFarm(user.id, createFarmDto);

      const res = await agent.get("/api/farms").set("Authorization", `Bearer ${token}`).query({ userId: user.id });
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
      const { token } = await loginUser(createUserDto);
      await updateUserLocationData(user.id, updateUserLocationDto);

      const res = await agent.get("/api/farms").set("Authorization", `Bearer ${token}`).query({ userId: user.id });
      const farms = res.body as GetFarmDto[];

      expect(res.statusCode).toBe(200);
      expect(farms).toBeDefined();
      expect(farms.length).toBe(0);
    });

    it("should throw UnprocessableEntityError when get farms as user that does not have location data", async () => {
      const user = await createUser(createUserDto);
      const { token } = await loginUser(createUserDto);

      const res = await agent.get("/api/farms").set("Authorization", `Bearer ${token}`).query({ userId: user.id });

      expect(res.statusCode).toBe(422);
      expect(res.body).toMatchObject({
        name: "UnprocessableEntityError",
        message: "User coordinates are not set",
      });
    });
  });
});
