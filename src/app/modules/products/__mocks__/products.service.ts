import { NotFoundException } from '@nestjs/common';
import { paginationResult, productData } from '../tests/product.data';

export const ProductsService = jest.fn().mockReturnValue({
  create: jest.fn().mockResolvedValue(productData()),
  findAll: jest.fn().mockResolvedValue(paginationResult()),
  findOne: jest
    .fn()
    .mockImplementation((id) =>
      id === productData().id
        ? Promise.resolve(productData())
        : Promise.reject(new NotFoundException()),
    ),

  update: jest
    .fn()
    .mockImplementation((id) =>
      id === productData().id
        ? Promise.resolve(productData())
        : Promise.reject(new Error(`Product with id ${id} not found.`)),
    ),

  remove: jest
    .fn()
    .mockImplementation((id) =>
      id === productData().id
        ? Promise.resolve('Promise resolves with void')
        : Promise.reject(new Error(`Product with id ${id} not found.`)),
    ),
});
