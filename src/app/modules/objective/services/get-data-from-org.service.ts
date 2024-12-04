import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GetFromOrganizatiAndEmployeInfoService {
  private readonly orgUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.orgUrl = this.configService.get<string>('ORG_SERVER');
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
}
