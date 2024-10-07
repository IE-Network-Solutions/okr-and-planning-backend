import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();

    // Check if the route is excluded from the guard
    const isExcluded = this.reflector.get<boolean>(
      'hasExcludedTenantId',
      handler,
    );
    if (isExcluded) {
      return true;
    }
    const tenantId = request.headers.tenantid;

    if (!tenantId) {
      throw new BadRequestException('tenantId In header is missing');
    }
    request.tenantId = tenantId;
    return true;
  }
}
