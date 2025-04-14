// src/excel/excel.module.ts
import { Module } from '@nestjs/common';
import { ExportExcelService } from './export-excel.module';

@Module({
  providers: [ExportExcelService],
  exports: [ExportExcelService],
})
export class ExcelModule {}
