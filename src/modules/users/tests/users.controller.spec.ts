import config from "config/config";
import { Express } from "express";
import { setupServer } from "server/server";
import { clearDatabase, disconnectAndClearDatabase } from "helpers/utils";
import http, { Server } from "http";
import ds from "orm/orm.config";
import supertest, { SuperAgentTest } from "supertest";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserLocationDataDto } from "../dto/update-userLocationData.dto";
import { UsersService } from "../users.service";
import { AuthService } from "modules/auth/auth.service";

describe("UsersController", () => {
  let app: Express;
  let agent: SuperAgentTest;
  let server: Server;

  let usersService: UsersService;
  let authService: AuthService;
  const createUserDto: CreateUserDto = { email: "userToUpdate@test.com", password: "password" };

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
    usersService = new UsersService();
  });

  describe("POST /users", () => {
    const createUserDto: CreateUserDto = { email: "user@test.com", password: "password" };

    it("should create new user", async () => {
      const res = await agent.post("/api/users").send(createUserDto);

      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({
        id: expect.any(String),
        email: expect.stringContaining(createUserDto.email) as string,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it("should throw UnprocessableEntityError if user already exists", async () => {
      await usersService.createUser(createUserDto);

      const res = await agent.post("/api/users").send(createUserDto);

      expect(res.statusCode).toBe(422);
      expect(res.body).toMatchObject({
        name: "UnprocessableEntityError",
        message: "A user for the email already exists",
      });
    });
  });

  describe("POST /users/location", () => {
    const createUser = async (userDto: CreateUserDto) => usersService.createUser(userDto);
    const loginUser = async (userDto: CreateUserDto) => authService.login(userDto);

    it("should update existing user", async () => {
      const updateUserLocationPropertiesDto: UpdateUserLocationDataDto = {
        address: "Nørrebro, Copenhagen, Denmark",
      };

      await createUser(createUserDto);
      const { token } = await loginUser(createUserDto);

      const res = await agent
        .post("/api/users/location")
        .set("Authorization", `Bearer ${token}`)
        .send(updateUserLocationPropertiesDto);

      expect(res.statusCode).toBe(201);
      expect(res.text).toEqual("User updated successfully");
    });

    it("should throw UnprocessableEntityError if invalid address is passed", async () => {
      const updateUserLocationPropertiesDto: UpdateUserLocationDataDto = {
        address: "invalid address",
      };

      await createUser(createUserDto);
      const { token } = await loginUser(createUserDto);

      const res = await agent
        .post("/api/users/location")
        .set("Authorization", `Bearer ${token}`)
        .send({ ...updateUserLocationPropertiesDto });

      expect(res.statusCode).toBe(422);
      expect(res.body).toMatchObject({
        name: "UnprocessableEntityError",
        message: "Invalid address",
      });
    });
  });
});
