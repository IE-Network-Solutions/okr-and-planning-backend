import { CreatePermissionDto } from '../dto/create-permission.dto';
import { Permission } from '../entities/permission.entity';

export const permissionData = () => {
  return {
    id: '1',
    name: 'create product',
    slug: 'create_product',
    createdAt: new Date('2022-10-22 07:11:42'),
    updatedAt: new Date('2022-10-22 07:11:42'),
  };
};

export const createpermissionData = (): CreatePermissionDto => {
  return {
    name: 'create product',
    slug: 'create_product',
  };
};

export const deletepermissionData = () => {
  return {
    raw: '',
    affected: 1,
    generatedMaps: [],
  };
};
