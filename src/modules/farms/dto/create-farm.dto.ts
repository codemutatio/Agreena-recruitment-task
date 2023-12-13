import { IsNotEmpty, IsNumber, IsString, IsUUID, IsLatLong } from "class-validator";

/**
 * @openapi
 * components:
 *  schemas:
 *    CreateFarmDto:
 *      type: object
 *      required:
 *        - address
 *        - coordinates
 *        - name
 *        - size
 *        - userId
 *        - yield
 *      properties:
 *        address:
 *          type: string
 *        coordinates:
 *          type: string
 *          description: "Comma-separated latitude and longitude (e.g., '55.67087112646539, 12.582277381808696')"
 *        name:
 *          type: string
 *        size:
 *          type: number
 *        userId:
 *          type: string
 *          format: uuid
 *        yield:
 *          type: number
 */
export class CreateFarmDto {
  @IsNotEmpty()
  @IsString()
  public address: string;

  @IsNotEmpty()
  @IsLatLong()
  public coordinates: string;

  @IsNotEmpty()
  @IsString()
  public name: string;

  @IsNotEmpty()
  @IsNumber()
  public size: number;

  @IsNotEmpty()
  @IsUUID()
  public userId: string;

  @IsNotEmpty()
  @IsNumber()
  public yield: number;
}
