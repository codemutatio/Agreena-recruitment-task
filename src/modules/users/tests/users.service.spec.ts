import config from "config/config";
import { UnprocessableEntityError } from "errors/errors";
import { Express } from "express";
import { setupServer } from "server/server";
import { clearDatabase, disconnectAndClearDatabase } from "helpers/utils";
import http, { Server } from "http";
import ds from "orm/orm.config";
import { CreateUserDto } from "../dto/create-user.dto";
import { User } from "../entities/user.entity";
import { UsersService } from "../users.service";
import { UpdateUserLocationDataDto } from "../dto/update-userLocationData.dto";

describe("UsersService", () => {
  let app: Express;
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
    usersService = new UsersService();
  });

  describe(".createUser", () => {
    const createUserDto: CreateUserDto = { email: "user@test.com", password: "password" };

    it("should create new user", async () => {
      const createdUser = await usersService.createUser(createUserDto);
      expect(createdUser).toBeInstanceOf(User);
    });

    describe("with existing user", () => {
      beforeEach(async () => {
        await usersService.createUser(createUserDto);
      });

      it("should throw UnprocessableEntityError if user already exists", async () => {
        await usersService.createUser(createUserDto).catch((error: UnprocessableEntityError) => {
          expect(error).toBeInstanceOf(UnprocessableEntityError);
          expect(error.message).toBe("A user for the email already exists");
        });
      });
    });
  });

  describe(".updateUserLocationProperties", () => {
    const createUserDto: CreateUserDto = { email: "user@test.com", password: "password" };
    const updateUserLocationDto: UpdateUserLocationDataDto = {
      address: "Nørrebro, Copenhagen, Denmark",
    };

    it("should update user with location properties", async () => {
      const user = await usersService.createUser(createUserDto);
      const updatedUser = await usersService.updateUserLocation(user.id, updateUserLocationDto);

      expect(updatedUser.address).toBe(updateUserLocationDto.address);
      expect(updatedUser.coordinates.split(",").length).toBe(2);
    });

    it("should throw UnprocessableEntityError if address coordinates is empty", async () => {
      const user = await usersService.createUser(createUserDto);

      await usersService
        .updateUserLocation(user.id, {
          address: "invalid address",
        })
        .catch((error: UnprocessableEntityError) => {
          expect(error).toBeInstanceOf(UnprocessableEntityError);
          expect(error.message).toBe("Invalid address");
        });
    });
  });

  describe(".findOneBy", () => {
    const createUserDto: CreateUserDto = { email: "user@test.com", password: "password" };

    it("should get user by provided param", async () => {
      const user = await usersService.createUser(createUserDto);
      const foundUser = await usersService.findOneBy({ email: user?.email });

      expect(foundUser).toMatchObject({ ...user });
    });

    it("should return null if user not found by provided param", async () => {
      const foundUser = await usersService.findOneBy({ email: "notFound@mail.com" });
      expect(foundUser).toBeNull();
    });
  });
});
