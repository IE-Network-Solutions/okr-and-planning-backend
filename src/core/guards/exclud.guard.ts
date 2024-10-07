import { SetMetadata } from '@nestjs/common';

export const ExcludeTenantGuard = () =>
  SetMetadata('hasExcludedTenantId', true);

export const ExcludeAuthGuard = () => SetMetadata('hasExcludedToken', true);
