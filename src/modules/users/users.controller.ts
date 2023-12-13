import { NextFunction, Request, Response } from "express";
import { UserDto } from "../auth/dto/user.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersService } from "./users.service";
import { UpdateUserLocationDataDto } from "./dto/update-userLocationData.dto";

export class UsersController {
  private readonly usersService: UsersService;

  constructor() {
    this.usersService = new UsersService();
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.usersService.createUser(req.body as CreateUserDto);
      res.status(201).send(UserDto.createFromEntity(user));
    } catch (error) {
      next(error);
    }
  }

  public async updateUserLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { address, coordinates } = req.body as UpdateUserLocationDataDto;

      const user = await this.usersService.updateUserLocation(userId, { address, coordinates });
      res.status(201).send(UserDto.createFromEntity(user));
    } catch (error) {
      next(error);
    }
  }
}
