import { HttpService } from '@nestjs/axios';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class GetFromOrganizatiAndEmployeInfoService {
  private readonly orgUrl: string;
  private authToken: string | null = null;

  constructor(
    private readonly httpService: HttpService,
    @Inject(REQUEST) private readonly request: Request,
    private readonly configService: ConfigService,
  ) {
    this.orgUrl = this.configService.get<string>(
      'externalUrls.orgStructureUrl',
    );
    this.authToken = request['authToken'];
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

  async getChildDepartmentsWithUsers(departmentId: string, tenantId: string) {
    const response = await this.httpService
      .get(
        `${this.orgUrl}/departments/child-departments/departments/all-levels/users/${departmentId}`,
        {
          headers: {
            tenantid: tenantId,
            Authorization: this.request['authToken'],
          },
        },
      )
      .toPromise();
    return response.data;
  }

  async getOneUSer(userId: string, tenantId: string) {
    const response = await this.httpService
      .get(`${this.orgUrl}/users/${userId}`, {
        headers: {
          tenantid: tenantId,
          Authorization: this.request['authToken'],
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
  async getAllSessions(tenantId: string) {
    const response = await this.httpService
      .get(`${this.orgUrl}/session`, {
        headers: {
          tenantid: tenantId,
          Authorization: this.request['authToken'],
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
          Authorization: this.request['authToken'],
        },
      })
      .toPromise();
    return response.data;
  }

  async getAllActiveUsers(tenantId: string) {
    const response = await this.httpService
      .get(`${this.orgUrl}/users/all-users/all/payroll-data`, {
        headers: {
          tenantid: tenantId,
          Authorization: this.request['authToken'],
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
