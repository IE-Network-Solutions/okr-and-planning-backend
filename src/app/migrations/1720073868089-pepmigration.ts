import { MigrationInterface, QueryRunner } from 'typeorm';

export class Pepmigration1720073868089 implements MigrationInterface {
  name = 'Pepmigration1720073868089';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "client" RENAME COLUMN "myemail" TO "myemailiscute"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "price" TYPE numeric`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "pricjjjjjjjjjjjjjjjjje" TYPE numeric`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "pricjjjjjjjjjjjjjjjjje" TYPE numeric`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "price" TYPE numeric`,
    );
    await queryRunner.query(
      `ALTER TABLE "client" RENAME COLUMN "myemailiscute" TO "myemail"`,
    );
  }
}
