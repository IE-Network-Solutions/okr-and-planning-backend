import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { mockDeep, MockProxy } from 'jest-mock-extended';

import { NotFoundException } from '@nestjs/common';

import { Repository } from 'typeorm';
import { ClientsService } from './clients.service';
import { Client } from './entities/client.entity';
import { clientData } from './tests/client.data';

jest.mock('./clients.service');
describe('clinetService', () => {
  let clinetService: ClientsService;
  let clientRepository: MockProxy<Repository<Client>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: getRepositoryToken(Client),
          useValue: ClientsService,
          // useValue: mockDeep<Repository<Clients>>(),
        },
      ],
    }).compile();

    clinetService = moduleRef.get<ClientsService>(ClientsService);
    clientRepository = moduleRef.get(getRepositoryToken(Client));
  });

  describe('create', () => {
    describe('when create is called', () => {
      let clients: Client;

      beforeEach(async () => {
        clients = await clinetService.registerClient(clientData());
      });

      test('then it should call clinetService.create', async () => {
        await expect(clinetService.registerClient).toHaveBeenCalledWith(
          clientData(),
        );
      });
      // test('then it should call clinetService.save', async () => {
      //   await expect(clinetService.save).toHaveBeenCalledWith(createClientsData());
      // })

      test('then it should return Clients', () => {
        expect(clients).toEqual(clientData());
      });
    });
  });
});
