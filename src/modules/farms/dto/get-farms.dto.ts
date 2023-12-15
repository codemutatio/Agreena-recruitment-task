import { Expose, Transform } from "class-transformer";

/**
 * @openapi
 * components:
 *  schemas:
 *    GetFarmDto:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *          description: The name of the farm.
 *        address:
 *          type: string
 *          description: The physical address of the farm.
 *        owner:
 *          type: string
 *          description: The email address of the farm owner.
 *        size:
 *          type: number
 *          description: The size of the farm.
 *        yield:
 *          type: number
 *          description: The yield of the farm.
 *        drivingDistance:
 *          type: number
 *          format: float
 *          description: The travel distance from the farm to the requesting user's address.
 *        createdAt:
 *          type: string
 *          format: date-time
 *          description: The date and time when the farm was created.
 */
export class GetFarmDto {
  @Expose()
  public readonly id: string;

  @Expose()
  public name: string;

  @Expose()
  public address: string;

  @Expose()
  public owner: string;

  @Expose()
  public size: number;

  @Expose()
  public yield: number;

  @Expose()
  public drivingDistance: number;

  @Expose()
  @Transform(({ value }) => (value as Date).toISOString(), { toClassOnly: true })
  public createdAt: Date;
}
