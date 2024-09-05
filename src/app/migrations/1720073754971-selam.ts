import { MigrationInterface, QueryRunner } from 'typeorm';

export class Selam1720073754971 implements MigrationInterface {
  name = 'Selam1720073754971';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "client" DROP COLUMN "contactInfo"`);
    await queryRunner.query(
      `ALTER TABLE "client" DROP COLUMN "phoneNumbevvvvvvvvvvvvvvvvvr"`,
    );
    await queryRunner.query(
      `ALTER TABLE "client" ADD "slslslslls" character varying(50) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "client" ADD "contactInfokkkk" character varying(50) NOT NULL`,
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
      `ALTER TABLE "client" DROP COLUMN "contactInfokkkk"`,
    );
    await queryRunner.query(`ALTER TABLE "client" DROP COLUMN "slslslslls"`);
    await queryRunner.query(
      `ALTER TABLE "client" ADD "phoneNumbevvvvvvvvvvvvvvvvvr" character varying(50) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "client" ADD "contactInfo" character varying(50) NOT NULL`,
    );
  }
}
