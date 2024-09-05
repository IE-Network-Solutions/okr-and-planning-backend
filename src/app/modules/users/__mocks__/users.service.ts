import { NotFoundException } from '@nestjs/common';

import { paginationResultUserData, userData } from '../tests/user.data';

export const UsersService = jest.fn().mockReturnValue({
  create: jest.fn().mockResolvedValue(userData()),
  findAll: jest.fn().mockResolvedValue(paginationResultUserData()),
  findOne: jest
    .fn()
    .mockImplementation((id) =>
      id === userData().id
        ? Promise.resolve(userData())
        : Promise.reject(new NotFoundException()),
    ),

  update: jest
    .fn()
    .mockImplementation((id) =>
      id === userData().id
        ? Promise.resolve(userData())
        : Promise.reject(new Error(`User with id ${id} not found.`)),
    ),

  remove: jest
    .fn()
    .mockImplementation((id) =>
      id === userData().id
        ? Promise.resolve('Promise resolves with void')
        : Promise.reject(new Error(`User with id ${id} not found.`)),
    ),
});
