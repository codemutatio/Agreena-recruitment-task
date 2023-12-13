import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFarmTable1702484212080 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "farm" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "address" character varying NOT NULL,
          "coordinates" point NOT NULL,
          "name" character varying NOT NULL,
          "size" real NOT NULL,
          "yield" real NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP DEFAULT now(),
          "userId" uuid,
          CONSTRAINT "PK_d17bf2df-6082-4849-a02b-71f08a5d815d" PRIMARY KEY ("id")
        )`,
    );
    await queryRunner.query(
      `ALTER TABLE "farm" 
         ADD CONSTRAINT "FK_41bed25c-c22e-4f9c-855f-a2feee3a9184" 
         FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "farm" DROP CONSTRAINT "FK_41bed25c-c22e-4f9c-855f-a2feee3a9184"`);
    await queryRunner.query(`DROP TABLE "farm"`);
  }
}
