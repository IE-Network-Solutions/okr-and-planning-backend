import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GetFromOrganizatiAndEmployeInfoService {
  private readonly orgUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.orgUrl = this.configService.get<string>(
      'externalUrls.orgStructureUrl',
    );
  }
  async getUsers(userId: string, tenantId: string) {
    const response = await this.httpService
      .get(`${this.orgUrl}/users/${userId}`, {
        headers: {
          tenantid: tenantId,
        },
      })
      .toPromise();
    return response.data;
  }

  async getDepartmentsWithUsers(tenantId: string) {
    const response = await this.httpService
      .get(`${this.orgUrl}/users/all/departments`, {
        headers: {
          tenantid: tenantId,
        },
      })
      .toPromise();
    return response.data;
  }

  async getActiveMonth(tenantId: string) {
    const response = await this.httpService
      .get(`${this.orgUrl}/month/active/month`, {
        headers: {
          tenantid: tenantId,
        },
      })
      .toPromise();
    return response.data;
  }

  async getActiveSession(tenantId: string) {
    const response = await this.httpService
      .get(`${this.orgUrl}/session/active/session`, {
        headers: {
          tenantid: tenantId,
        },
      })
      .toPromise();
    return response.data;
  }
  async activatePreviousActiveMonth(tenantId: string) {
    const response = await this.httpService
      .get(`${this.orgUrl}/month/previousMonth/month`, {
        headers: {
          tenantid: tenantId,
        },
      })
      .toPromise();
    return response.data;
  }

  async getAllUsers(tenantId: string) {
    const response = await this.httpService
      .get(`${this.orgUrl}/users`, {
        headers: {
          tenantid: tenantId,
        },
      })
      .toPromise();
    return response.data;
  }

  async getAllUsersWithTenant(tenantId: string) {
    const response = await this.httpService
      .get(`${this.orgUrl}/users/simple-info/all-user/with-tenant`, {
        headers: {
          tenantid: tenantId,
        },
      })
      .toPromise();
    return response.data;
  }

  async childDepartmentWithUsers(tenantId: string, departmentId: string) {
    try {
      const response = await this.httpService
        .get(`${this.orgUrl}/users/child/departments/${departmentId}`, {
          headers: {
            tenantid: tenantId,
          },
        })
        .toPromise();
      return response.data;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getUsersSalary(tenantId: string) {
    try {
      const response = await this.httpService
        .get(`${this.orgUrl}/basic-salary/active`, {
          headers: {
            tenantid: tenantId,
          },
        })
        .toPromise();
      return response.data;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
