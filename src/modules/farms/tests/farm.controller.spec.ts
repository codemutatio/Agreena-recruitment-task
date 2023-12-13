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

describe("FarmsController", () => {
  let app: Express;
  let agent: SuperAgentTest;
  let server: Server;

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

    agent = supertest.agent(app);
    usersService = new UsersService();
  });

  describe("POST /farm", () => {
    const createUser = async (userDto: CreateUserDto) => usersService.createUser(userDto);
    const createFarmDto: CreateFarmDto = {
      name: "Farm 1",
      address: "Farm 1 address",
      coordinates: "55.67087112646539, 12.582277381808696",
      size: 100.3,
      userId: "",
      yield: 90.4,
    };
    const createUserDto: CreateUserDto = { email: "user@test.com", password: "password" };

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
});
