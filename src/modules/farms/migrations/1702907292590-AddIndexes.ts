import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexes1702907292590 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE INDEX "IDX_farm_name" ON "farm" ("name")`);

    await queryRunner.query(`CREATE INDEX "IDX_farm_yield" ON "farm" ("yield")`);

    await queryRunner.query(`CREATE INDEX "IDX_farm_createdAt" ON "farm" ("createdAt")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_farm_name"`);

    await queryRunner.query(`DROP INDEX "IDX_farm_yield"`);

    await queryRunner.query(`DROP INDEX "IDX_farm_createdAt"`);
  }
}
