import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OrgEmployeeInformationApiService {
  
  // It's better to initialize the ORG_SERVER directly from the environment variable
  private ORG_SERVER = process.env.ORG_SERVER;

  async getUserInfo(tenantId: string, userIds: string[]): Promise<any> {
    if (!this.ORG_SERVER) {
      throw new HttpException('ORG_SERVER URL not defined', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    try {
      // Make a GET request to the external API, passing tenantId in headers
      const response = await axios.get(`${this.ORG_SERVER}/users/info/user-info`, {
        headers: {
          tenantId: tenantId, // Add tenantId to headers
        },
        params: {
          userIds: userIds, // Add user IDs as a query parameter
        },
      });

      // Return the response data
      return response.data;
    } catch (error) {
      console.error('Error fetching user info:', error);

      // Handle different response errors (if Axios provides one)
      if (error.response) {
        throw new HttpException(
          error.response.data || 'Failed to fetch user info',
          error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      throw new HttpException(
        'Failed to fetch user info',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
