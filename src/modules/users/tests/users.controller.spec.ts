import config from "config/config";
import { Express } from "express";
import { setupServer } from "server/server";
import { clearDatabase, disconnectAndClearDatabase } from "helpers/utils";
import http, { Server } from "http";
import ds from "orm/orm.config";
import supertest, { SuperAgentTest } from "supertest";
import { v4 as uuidv4 } from "uuid";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserLocationDataDto } from "../dto/update-userLocationData.dto";
import { UsersService } from "../users.service";
import { User } from "../entities/user.entity";

describe("UsersController", () => {
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

  describe("POST /users/:userId/location", () => {
    const createUser = async (userDto: CreateUserDto) => usersService.createUser(userDto);
    const createUserDto: CreateUserDto = { email: "userToUpdate@test.com", password: "password" };
    const updateUserLocationPropertiesDto: UpdateUserLocationDataDto = {
      address: "Test Address",
      coordinates: "52.670925580780214, 10.582320297150432",
    };

    it("should update existing user", async () => {
      const { id } = await createUser(createUserDto);

      const res = await agent.post(`/api/users/${id}/location`).send(updateUserLocationPropertiesDto);
      const user = res.body as User;

      expect(res.statusCode).toBe(201);
      expect(user).toBeDefined();
      expect(user.address).toBe(updateUserLocationPropertiesDto.address);
      expect(user.coordinates).toBe(updateUserLocationPropertiesDto.coordinates);
    });

    it("should throw UnprocessableEntityError when updating user that does not exists", async () => {
      const res = await agent.post(`/api/users/${uuidv4()}/location`).send(updateUserLocationPropertiesDto);

      expect(res.statusCode).toBe(422);
      expect(res.body).toMatchObject({
        name: "UnprocessableEntityError",
        message: "No existing user with this ID",
      });
    });
  });
});
