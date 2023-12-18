import { IsNotEmpty, IsNumber, IsString } from "class-validator";

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
 *        - yield
 *      properties:
 *        address:
 *          type: string
 *          description: "Address of the farm"
 *          example: "Nørrebro, Copenhagen, Denmark"
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
  @IsString()
  public name: string;

  @IsNotEmpty()
  @IsNumber()
  public size: number;

  @IsNotEmpty()
  @IsNumber()
  public yield: number;
}
