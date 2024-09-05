import { Pagination } from 'nestjs-typeorm-paginate';
import { CreateUserDto } from '../dto/create-user.dto';

export const userData = () => {
  //  let data = productData()

  return {
    id: '1',
    name: 'Product 1',
    email: 's@s.com',
    createdAt: new Date('2022-10-22 07:11:42'),
    updatedAt: new Date('2022-10-22 07:11:42'),
    //   products: [data]
  };
};

export const createuserData = (): CreateUserDto => {
  return {
    name: 'Product 1',
    email: 's@s.com',
  };
};

export const deleteuserData = () => {
  return {
    raw: '',
    affected: 1,
    generatedMaps: [],
  };
};

export const paginationResultUserData = (): Pagination<CreateUserDto> => {
  return {
    items: [userData()],
    meta: {
      totalItems: 1,
      itemCount: 1,
      itemsPerPage: 10,
      totalPages: 1,
      currentPage: 1,
    },
  };
};
