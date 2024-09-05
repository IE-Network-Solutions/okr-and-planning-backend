import { Pagination } from 'nestjs-typeorm-paginate';
import { productData } from '../../products/tests/product.data';
import { Client } from '../entities/client.entity';
import { CreateClientDto } from '../dto/create-client.dto';

export const clientData = () => {
  //  let data = productData()

  return {
    id: '1',
    name: 'Product 1',
    email: 's@s.com',
    createdAt: new Date('2022-10-22 07:11:42'),
    updatedAt: new Date('2022-10-22 07:11:42'),
    phoneNumber: '5666677',
    contactInfo: 'fghj',
    licenseDate: new Date('2022-10-22 07:11:42'),
    status: 'active',
  };
};

export const createClientData = (): CreateClientDto => {
  return {
    name: 'Product 1',
    email: 's@s.com',
    phoneNumber: '5666677',
    contactInfo: 'fghj',
    licenseDate: new Date('2022-10-22 07:11:42'),
    status: 'active',
  };
};
