import { IsNotEmpty, IsString, IsLatLong } from "class-validator";

/**
 * @openapi
 * components:
 *  schemas:
 *    UpdateUserLocationDataDto:
 *      type: object
 *      required:
 *        - address
 *        - coordinates
 *      properties:
 *        address:
 *          type: string
 *          default: Langebrogade 3F, 3rd Floor, 1411 Copenhagen K, Denmark
 *        coordinates:
 *          type: string
 *          default: '55.67087112646539, 12.582277381808696'
 */
export class UpdateUserLocationDataDto {
  @IsString()
  @IsNotEmpty()
  public address: string;

  @IsLatLong()
  @IsNotEmpty()
  public coordinates: string;
}


