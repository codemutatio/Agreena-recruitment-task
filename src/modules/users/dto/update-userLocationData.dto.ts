import { IsNotEmpty, IsString } from "class-validator";

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
 */
export class UpdateUserLocationDataDto {
  @IsString()
  @IsNotEmpty()
  public address: string;
}


