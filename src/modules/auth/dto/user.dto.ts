import { Expose, plainToClass, Transform } from "class-transformer";
import { User } from "../../users/entities/user.entity";

/**
 * @openapi
 * components:
 *  schemas:
 *    UserDto:
 *      type: object
 *      properties:
 *        id:
 *          type: string
 *        email:
 *          type: string
 *        address:
 *          type: string
 *        coordinates:
 *          type: string
 *        createdAt:
 *          type: string
 *        updatedAt:
 *          type: string
 */
export class UserDto {
  constructor(partial?: Partial<UserDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  public readonly id: string;

  @Expose()
  public email: string;

  @Transform(({ value }) => (value as string) || "")
  @Expose()
  public address?: string;

  @Expose()
  public coordinates?: string;

  @Transform(({ value }) => (value as Date).toISOString())
  @Expose()
  public createdAt: Date;

  @Transform(({ value }) => (value as Date).toISOString())
  @Expose()
  public updatedAt: Date;

  public static createFromEntity(user: User | null): UserDto | null {
    if (!user) {
      return null;
    }

    return plainToClass(UserDto, user);
  }
}
