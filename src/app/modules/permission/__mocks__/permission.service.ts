import { NotFoundException } from '@nestjs/common';
import { permissionData } from '../tests/permission.data';

export const PermissionService = jest.fn().mockReturnValue({
  create: jest.fn().mockResolvedValue(permissionData()),
  findAll: jest.fn().mockResolvedValue([permissionData()]),
  findOne: jest
    .fn()
    .mockImplementation((id) =>
      id === permissionData().id
        ? Promise.resolve(permissionData())
        : Promise.reject(new NotFoundException()),
    ),

  update: jest
    .fn()
    .mockImplementation((id) =>
      id === permissionData().id
        ? Promise.resolve(permissionData())
        : Promise.reject(new Error(`Permission with id ${id} not found.`)),
    ),

  remove: jest
    .fn()
    .mockImplementation((id) =>
      id === permissionData().id
        ? Promise.resolve('Promise resolves with void')
        : Promise.reject(new Error(`Permission with id ${id} not found.`)),
    ),
});
