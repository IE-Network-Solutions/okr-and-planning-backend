import { MigrationInterface, QueryRunner } from 'typeorm';

export class Pepmigration1720073995396 implements MigrationInterface {
  name = 'Pepmigration1720073995396';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "myemail" TO "myemailisababababba"`,
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
      `ALTER TABLE "user" RENAME COLUMN "myemailisababababba" TO "myemail"`,
    );
  }
}
