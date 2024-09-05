import { Test } from '@nestjs/testing';

import { ProductsService } from './products.service';
import { productData } from './tests/product.data';
import { Product } from './entities/product.entity';
import { ProductsController } from './products.controller';

jest.mock('./products.service');

describe('ProductsController', () => {
  let productsController: ProductsController;
  let productsService: ProductsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [ProductsController],
      providers: [ProductsService],
    }).compile();

    productsController = moduleRef.get<ProductsController>(ProductsController);
    productsService = moduleRef.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  // describe('findAll', () => {
  //   describe('when findAll is called', () => {
  //     let products: Product[];
  //     const options = { page: 1, limit: 10 };
  //     beforeEach(async () => {

  //       let products = await productsController.findAll(options);
  //     });

  //     test('then it should call ProductsService', () => {
  //       expect(productsService.findAll).toHaveBeenCalled(

  //       );
  //     });

  //     test('then is should return a Productss', async () => {
  //       expect(await productsController.findAll(options)).toEqual(paginationResult());
  //     });
  //   });
  // });

  describe('findOne', () => {
    describe('when findOne is called', () => {
      let products: Product;

      beforeEach(async () => {
        products = await productsController.findOne(productData().id);
      });

      test('then it should call productService', () => {
        expect(productsService.findOne).toHaveBeenCalledWith(productData().id);
      });

      test('then it should return Products', () => {
        expect(products).toEqual(productData());
      });
    });
  });

  describe('create', () => {
    describe('when create is called', () => {
      let products: Product;

      beforeEach(async () => {
        products = await productsController.create(productData());
      });

      test('then it should call ProductsService', () => {
        expect(productsService.create).toHaveBeenCalledWith(productData());
      });

      test('then it should return a product', () => {
        expect(products).toEqual(productData());
      });
    });
  });

  describe('update', () => {
    describe('when update is called', () => {
      let products: Product;

      beforeEach(async () => {
        products = await productsController.update(
          productData().id,
          productData(),
        );
      });

      test('then it should call ProductsService', () => {
        expect(productsService.update).toHaveBeenCalledWith(
          productData().id,
          productData(),
        );
      });

      test('then it should return a Products', () => {
        expect(products).toEqual(productData());
      });
    });
  });

  describe('remove', () => {
    describe('when remove is called', () => {
      // let products: Product;

      beforeEach(async () => {
        await productsController.remove(productData().id);
      });

      test('then it should call ProductsService', () => {
        expect(productsService.remove).toHaveBeenCalledWith(productData().id);
      });

      test('then it should return a Products', async () => {
        expect(await productsController.remove(productData().id)).toEqual(
          'Promise resolves with void',
        );
      });
    });
  });
});
