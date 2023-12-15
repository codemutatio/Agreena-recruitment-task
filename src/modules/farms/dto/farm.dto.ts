import { Expose, plainToClass, Transform } from "class-transformer";
import { Farm } from "../entities/farm.entity";

/**
 * @openapi
 * components:
 *  schemas:
 *    FarmDto:
 *      type: object
 *      properties:
 *        id:
 *          type: string
 *        address:
 *          type: string
 *        coordinates:
 *          type: string
 *        name:
 *          type: string
 *        size:
 *          type: number
 *        userId:
 *          type: string
 *        createdAt:
 *           type: string
 *        updatedAt:
 *          type: string
 */
export class FarmDto {
  constructor(partial?: Partial<FarmDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  public readonly id: string;

  @Transform(({ value }) => (value as string) || "")
  @Expose()
  public address?: string;

  @Transform(({ value }) => (value as string)?.replace(/[()]/g, "") || "")
  @Expose()
  public coordinates?: string;

  @Expose()
  public name: string;

  @Expose()
  public size: number;

  @Expose()
  public userId: string;

  @Expose()
  public yield: number;

  @Transform(({ value }) => (value as Date).toISOString())
  @Expose()
  public createdAt: Date;

  @Transform(({ value }) => (value as Date).toISOString())
  @Expose()
  public updatedAt: Date;

  public static createFromEntity(farm: Farm | null): FarmDto | null {
    if (!farm) {
      return null;
    }

    return plainToClass(FarmDto, farm);
  }
}
