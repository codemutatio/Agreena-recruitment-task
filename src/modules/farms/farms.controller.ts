import { NextFunction, Request, Response } from "express";
import { FarmDto } from "./dto/farm.dto";
import { CreateFarmDto } from "./dto/create-farm.dto";
import { FarmsService } from "./farms.service";

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
}
