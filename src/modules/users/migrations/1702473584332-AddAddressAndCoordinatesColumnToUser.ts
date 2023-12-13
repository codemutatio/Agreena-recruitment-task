import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAddressAndCoordinatesColumnToUser1702473584332 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user"
            ADD COLUMN "address" VARCHAR,
            ADD COLUMN "coordinates" POINT
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user"
            DROP COLUMN "address",
            DROP COLUMN "coordinates"
        `);
  }
}
