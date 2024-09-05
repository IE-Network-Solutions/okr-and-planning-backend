import { Pagination } from 'nestjs-typeorm-paginate';
import { CreateProductDto } from '../dto/create-product.dto';

export const productData = () => {
  //let data = userData()

  return {
    id: '1',
    name: 'Product 1',
    description: 'Description of product 1',
    category: 'Category A',
    pictureUrl: '',
    price: 100.0,
    createdAt: new Date('2022-10-22 07:11:42'),
    updatedAt: new Date('2022-10-22 07:11:42'),
    userId: '2',
    // user: data
  };
};

export const createProductData = (): CreateProductDto => {
  return {
    name: 'Product 1',
    description: 'Description of product 1',
    category: 'Category A',
    pictureUrl: '',
    price: 100.0,
    userId: '3',
  };
};

export const deleteProductnData = () => {
  return {
    raw: '',
    affected: 1,
    generatedMaps: [],
  };
};

export const paginationResult = (): Pagination<CreateProductDto> => {
  return {
    items: [productData()],
    meta: {
      totalItems: 1,
      itemCount: 1,
      itemsPerPage: 10,
      totalPages: 1,
      currentPage: 1,
    },
  };
};
