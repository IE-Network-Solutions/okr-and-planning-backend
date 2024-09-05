import { clientData } from '../tests/client.data';

export const ClientsService = jest.fn().mockReturnValue({
  registerClient: jest.fn().mockResolvedValue(clientData()),
});
