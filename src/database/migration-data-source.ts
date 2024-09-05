// src/db/data-source.ts
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import path = require('path');

config();
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,
  migrations: ['dist/app/migrations/*{.ts,.js}'],
  migrationsRun: true,
};
const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
