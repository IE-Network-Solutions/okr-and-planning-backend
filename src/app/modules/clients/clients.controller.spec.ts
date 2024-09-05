import { Test } from '@nestjs/testing';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { Client } from './entities/client.entity';
import { clientData } from './tests/client.data';

jest.mock('./clients.service');

describe('UsersController', () => {
  let clientsController: ClientsController;
  let clientsService: ClientsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [ClientsController],
      providers: [ClientsService],
    }).compile();
    clientsController = moduleRef.get<ClientsController>(ClientsController);
    clientsService = moduleRef.get<ClientsService>(ClientsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    describe('when create is called', () => {
      let clients: Client;

      beforeEach(async () => {
        clients = await clientsController.registerClient(clientData());
      });

      test('then it should call UsersService', () => {
        expect(clientsService.registerClient).toHaveBeenCalledWith(
          clientData(),
        );
      });

      test('then it should return a product', () => {
        expect(clients).toEqual(clientData());
      });
    });
  });
});
