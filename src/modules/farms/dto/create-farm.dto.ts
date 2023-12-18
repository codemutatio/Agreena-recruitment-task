import { IsNotEmpty, IsNumber, IsString, IsLatLong } from "class-validator";

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
 *          description: "Address of the farm"
 *          example: "Nørrebro, Copenhagen, Denmark"
 *        coordinates:
 *          type: string
 *          format: lat,long
 *          description: "Comma-separated latitude and longitude (e.g., '55.67087112646539, 12.582277381808696')"
 *          example: "55.67087112646539, 12.582277381808696"
 *        name:
 *          type: string
 *          description: "Name of the farm"
 *          example: "Farm 1"
 *        size:
 *          type: number
 *          format: float
 *          description: "Size of the farm in hectares"
 *          example: 100.3
 *        yield:
 *          type: number
 *          format: float
 *          description: "Yield of the farm in tons"
 *          example: 90.4
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
  @IsNumber()
  public yield: number;
}
