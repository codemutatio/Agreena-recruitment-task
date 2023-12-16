import { NextFunction, Request, Response } from "express";
import { plainToClass } from "class-transformer";
import { FarmDto } from "./dto/farm.dto";
import { CreateFarmDto } from "./dto/create-farm.dto";
import { FarmsService } from "./farms.service";
import { GetFarmsQueryDto } from "./dto/get-farmsQuery.dto";

export class FarmsController {
  private readonly farmsService: FarmsService;

  constructor() {
    this.farmsService = new FarmsService();
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const farm = await this.farmsService.createFarm(req.body as CreateFarmDto);
      res.status(201).send(FarmDto.createFromEntity(farm));
    } catch (error) {
      next(error);
    }
  }

  public async getFarms(req: Request, res: Response, next: NextFunction) {
    try {
      const farms = await this.farmsService.getFarms(req.user, plainToClass(GetFarmsQueryDto, req.query));
      res.status(200).send(farms);
    } catch (error) {
      next(error);
    }
  }
}
