import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

@Injectable()
export class ExportExcelService {
  async generateExcel(
    response: Response,
    data: any[],
    users: any[],
    sessions: any[],
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();

    // 1. Main Sheet with all OKR scores
    const mainSheet = workbook.addWorksheet('All OKRs');
    this.createMainSheet(mainSheet, data, users, sessions);

    // 2. Sheets grouped by sessionId
    const groupedBySession = this.groupBySessionId(data);
    Object.entries(groupedBySession).forEach(([sessionId, items]) => {
      const sheetName = this.sanitizeSheetName(sessionId);
      const sessionSheet = workbook.addWorksheet(sheetName);
      this.createSessionSheet(sessionSheet, items, users, sessions);
    });

    // Send the file
    response.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="okr_scores_${new Date().toISOString()}.xlsx"`,
    );

    await workbook.xlsx.write(response);
    response.end();
  }

  private createMainSheet(
    worksheet: ExcelJS.Worksheet,
    data: any[],
    users: any[],
    sessions: any[],
  ): void {
    worksheet.columns = [
      { header: 'Employee Name', key: 'userName', width: 30 },
      { header: 'Job Title', key: 'jobTitle', width: 25 },
      { header: 'Department', key: 'department', width: 25 },
      { header: 'Quarter', key: 'sessionName', width: 30 },
      {
        header: 'OKR Score',
        key: 'okrScore',
        width: 15,
        style: { numFmt: '0.00' },
      },
    ];

    data.forEach((item) => {
      const user = users.find((u) => u.userId === item.userId);
      const session = sessions.find((s) => s.sessionId === item.sessionId);
      const firstName = user?.firstName || '';
      const lastName = user?.lastName || '';
      const position =
        user?.employeeJobInformation?.[0]?.position?.name || 'N/A';
      const department =
        user?.employeeJobInformation?.[0]?.department?.name || 'N/A';

      worksheet.addRow({
        userName: `${firstName} ${lastName}`.trim() || item.userId,
        jobTitle: position,
        department,
        sessionName: session?.name || item.sessionId || 'Unknown Session',
        okrScore: Number(item.okrScore),
      });
    });

    worksheet.autoFilter = {
      from: 'A1',
      to: 'E1',
    };
  }

  private createSessionSheet(worksheet: ExcelJS.Worksheet, data: any[],users:any[],sessions:any[]): void {
    worksheet.columns = [
        { header: 'Employee Name', key: 'userName', width: 30 },
        { header: 'Job Title', key: 'jobTitle', width: 25 },
        { header: 'Department', key: 'department', width: 25 },
        { header: 'Quarter', key: 'sessionName', width: 30 },
        {
          header: 'OKR Score',
          key: 'okrScore',
          width: 15,
          style: { numFmt: '0.00' },
        },
      ];

      data.forEach((item) => {
        const user = users.find((u) => u.userId === item.id);
        const session = sessions.find((s) => s.sessionId === item.id);
     
  
        const firstName = user?.firstName || '';
        const lastName = user?.lastName || '';
        const position =
          user?.employeeJobInformation?.[0]?.position?.name || 'N/A';
        const department =
          user?.employeeJobInformation?.[0]?.department?.name || 'N/A';
  
        worksheet.addRow({
          userName: `${firstName} ${lastName}`.trim() || item.userId,
          jobTitle: position,
          department,
          sessionName: session?.name || item.sessionId || 'Unknown Session',
          okrScore: Number(item.okrScore),
        });
      });

    worksheet.autoFilter = {
      from: 'A1',
      to: 'B1',
    };
  }

  private groupBySessionId(data: any[]): Record<string, any[]> {
    return data.reduce((acc, item) => {
      const key = item.sessionId || 'Unknown Session';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, any[]>);
  }

  private sanitizeSheetName(name: string): string {
    return name
      .substring(0, 31)
      .replace(/[\\/*\[\]:?]/g, '')
      .trim();
  }
}
