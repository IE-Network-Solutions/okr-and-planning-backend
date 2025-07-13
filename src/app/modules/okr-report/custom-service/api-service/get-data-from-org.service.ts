import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OrgEmployeeInformationApiService {
  // It's better to initialize the ORG_SERVER directly from the environment variable
  private orgServer = process.env.ORG_SERVER;

  async getUserInfo(tenantId: string, userIds: string[]): Promise<any> {
    if (!this.orgServer) {
      throw new HttpException(
        'Unable to connect to organization services. Please contact support.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      // Make a GET request to the external API, passing tenantId in headers
      const response = await axios.get(
        `${this.orgServer}/users/info/user-info`,
        {
          headers: {
            tenantId: tenantId, // Add tenantId to headers
          },
          params: {
            userIds: userIds, // Add user IDs as a query parameter
          },
        },
      );

      // Return the response data
      return response.data;
    } catch (error) {
      // Handle different response errors (if Axios provides one)
      if (error.response) {
        throw new HttpException(
          'Unable to retrieve user information. Please try again later.',
          error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      throw new HttpException(
        'Unable to connect to organization services. Please check your connection and try again.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async groupReportTasksByKeyResult(reports: any[]): Promise<any> {
    return reports.map((report) => {
      const groupedTasks = report.reportTask.reduce((acc, task) => {
        // Extract keyResultId and planTaskId from each reportTask
        const keyResultId = task.planTask?.keyResult?.id;
        const planTaskId = task.planTask?.id;

        // Create a unique key combining keyResultId and planTaskId
        const groupKey = `${keyResultId}-${planTaskId}`;

        // If this group key doesn't exist, initialize it
        if (!acc[groupKey]) {
          acc[groupKey] = {
            keyResult: task.planTask?.keyResult,
            tasks: [],
          };
        }

        // Push the current task into the corresponding group
        acc[groupKey].tasks.push(task);

        return acc;
      }, {});

      // Convert the grouped tasks into an array of key results
      const keyResultKey = Object.values(groupedTasks);

      return {
        ...report,
        keyResultKey, // Add the grouped key results to the report object
      };
    });
  }
}
