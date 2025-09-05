import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AttendanceRecord {
  userId: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
  hoursWorked?: number;
  notes?: string;
}

export interface AttendanceResponse {
  success: boolean;
  data: AttendanceRecord[];
  message?: string;
}

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);
  private readonly attendanceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.attendanceUrl = this.configService.get<string>('externalUrls.attendanceUrl');
  }

  /**
   * Get all attendance records for a specific date
   */
  async getAttendanceRecordsForDate(date: string, tenantId: string): Promise<AttendanceRecord[]> {
    try {
      this.logger.debug(`Getting attendance records for date: ${date}`);

      // Convert date to ISO format with timezone
      const fromDate = new Date(date + 'T00:00:00.000Z').toISOString();
      
      const response = await this.httpService
        .post(`${this.attendanceUrl}/attendance`, {
          filter: {
            date: {
              from: fromDate
            }
          }
        }, {
          headers: {
            'Content-Type': 'application/json',
            'tenantId': tenantId,
          },
        })
        .toPromise();

      if (response.data.success && response.data.data) {
        this.logger.debug(`Found ${response.data.data.length} attendance records for date: ${date}`);
        return response.data.data;
      }

      this.logger.debug(`No attendance records found for date: ${date}`);
      return [];
    } catch (error) {
      this.logger.error(`Error getting attendance records for date ${date}: ${error.message}`);
      if (error.response) {
        this.logger.error(`Response status: ${error.response.status}`);
        this.logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
      }
      throw new BadRequestException(`Failed to get attendance records: ${error.message}`);
    }
  }

  /**
   * Check if user attended on a specific date
   */
  async didUserAttend(userId: string, date: string, tenantId: string): Promise<boolean> {
    try {
      const attendanceRecords = await this.getAttendanceRecordsForDate(date, tenantId);
      
      // Find the user's attendance record
      const userAttendanceRecord = attendanceRecords.find(record => record.userId === userId);
      
      if (!userAttendanceRecord) {
        this.logger.debug(`User ${userId} has no attendance record for date: ${date}`);
        return false;
      }

      const attended = userAttendanceRecord.status === 'present' || userAttendanceRecord.status === 'late' || userAttendanceRecord.status === 'half-day';
      this.logger.debug(`User ${userId} attendance status for date ${date}: ${userAttendanceRecord.status} (attended: ${attended})`);
      
      return attended;
    } catch (error) {
      this.logger.error(`Error checking attendance for user ${userId}: ${error.message}`);
      return false; // Default to false if we can't check attendance
    }
  }

  /**
   * Get attendance status for a user on a specific date
   */
  async getUserAttendanceStatus(userId: string, date: string, tenantId: string): Promise<string | null> {
    try {
      const attendanceRecords = await this.getAttendanceRecordsForDate(date, tenantId);
      
      // Find the user's attendance record
      const userAttendanceRecord = attendanceRecords.find(record => record.userId === userId);
      
      return userAttendanceRecord ? userAttendanceRecord.status : null;
    } catch (error) {
      this.logger.error(`Error getting attendance status for user ${userId}: ${error.message}`);
      return null;
    }
  }
}