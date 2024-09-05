import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

//import { MockProxy } from 'jest-mock-extended';
import { ProductsService } from './products.service';
//import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { productData } from './tests/product.data';
import { NotFoundException } from '@nestjs/common';

jest.mock('./products.service');
describe('ProductsService', () => {
  let productsService: ProductsService;
  // let productsRepository: MockProxy<Repository<Product>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: ProductsService,
          // useValue: mockDeep<Repository<Products>>(),
        },
      ],
    }).compile();

    productsService = moduleRef.get<ProductsService>(ProductsService);
    //  productsRepository = moduleRef.get(getRepositoryToken(Product));
  });

  describe('findOne', () => {
    describe('when findOne is called', () => {
      let products: Product;

      beforeEach(async () => {
        products = await productsService.findOne(productData().id);
      });

      test('then it should call ProductsService.findOne with the correct id', async () => {
        await expect(productsService.findOne).toHaveBeenCalledWith(
          productData().id,
        );
      });

      test('then it should return Products', () => {
        expect(products).toEqual(productData());
      });
      test('it should throw not found exception if id is not found', async () => {
        const wrongId = '4567';
        await expect(productsService.findOne(wrongId)).rejects.toThrow(
          NotFoundException,
        );
        // await expect(Products).rejects.toThrow(NotFoundException)
      });
    });
  });

  // describe('findAll', () => {
  //   describe('when findAll is called', () => {
  //     let products: Product[];
  //     const options = { page: 1, limit: 10 };

  //     beforeEach(async () => {
  //       await productsService.findAll(options);
  //     });

  //     test('then it should call ProductsService.findAll', async () => {
  //       await expect(productsService.findAll).toHaveBeenCalledWith(options);
  //     });

  //     test('then it should return Products', async () => {
  //       expect(await productsService.findAll(options)).toEqual(paginationResult());
  //     });
  //   });
  // });

  describe('create', () => {
    describe('when create is called', () => {
      let products: Product;

      beforeEach(async () => {
        products = await productsService.create(productData());
      });

      test('then it should call ProductsService.create', async () => {
        await expect(productsService.create).toHaveBeenCalledWith(
          productData(),
        );
      });
      // test('then it should call ProductsService.save', async () => {
      //   await expect(ProductsService.save).toHaveBeenCalledWith(createProductsData());
      // })

      test('then it should return Products', () => {
        expect(products).toEqual(productData());
      });
    });
  });

  describe('update', () => {
    describe('when update is called', () => {
      let products: Product;

      beforeEach(async () => {
        products = await productsService.update(
          productData().id,
          productData(),
        );
      });

      test('then it should call ProductsService.update', async () => {
        await expect(productsService.update).toHaveBeenCalledWith(
          productData().id,
          productData(),
        );
      });
      test('it should throw Product with id ${id} not found. if id is not found', async () => {
        const wrongId = '4567';
        await expect(
          productsService.update(wrongId, productData()),
        ).rejects.toThrow(`Product with id ${wrongId} not found.`);
        // await expect(Products).rejects.toThrow(NotFoundException)
      });

      test('then it should return Products', () => {
        expect(products).toEqual(productData());
      });
    });
  });

  describe('remove', () => {
    describe('when remove is called', () => {
      //let products: Product;

      beforeEach(async () => {
        await productsService.remove(productData().id);
      });

      test('then it should call ProductsService.remove', async () => {
        await expect(productsService.remove).toHaveBeenCalledWith(
          productData().id,
        );
      });
      test('it should throw Product with id ${id} not found. if id is not found', async () => {
        const wrongId = '4567';
        await expect(productsService.remove(wrongId)).rejects.toThrow(
          `Product with id ${wrongId} not found.`,
        );
        // await expect(Products).rejects.toThrow(NotFoundException)
      });

      test('then it should return Products', async () => {
        expect(await productsService.remove(productData().id)).toEqual(
          'Promise resolves with void',
        );
      });
    });
  });
});
