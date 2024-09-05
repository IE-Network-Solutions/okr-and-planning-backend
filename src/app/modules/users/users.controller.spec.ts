import { Test } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { userData } from './tests/user.data';
import { User } from './entities/user.entity';

jest.mock('./users.service');

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    usersController = moduleRef.get<UsersController>(UsersController);
    usersService = moduleRef.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  // describe('findAll', () => {
  //   describe('when findAll is called', () => {
  //     let users: Product[];
  //     const options = { page: 1, limit: 10 };
  //     beforeEach(async () => {

  //       let users = await usersController.findAll(options);
  //     });

  //     test('then it should call UsersService', () => {
  //       expect(usersService.findAll).toHaveBeenCalled(

  //       );
  //     });

  //     test('then is should return a userss', async () => {
  //       expect(await usersController.findAll(options)).toEqual(paginationResult());
  //     });
  //   });
  // });

  describe('findOne', () => {
    describe('when findOne is called', () => {
      let users: User;

      beforeEach(async () => {
        users = await usersController.findOne(userData().id);
      });

      test('then it should call userservice', () => {
        expect(usersService.findOne).toHaveBeenCalledWith(userData().id);
      });

      test('then it should return users', () => {
        expect(users).toEqual(userData());
      });
    });
  });

  describe('create', () => {
    describe('when create is called', () => {
      let users: User;

      beforeEach(async () => {
        users = await usersController.create(userData());
      });

      test('then it should call UsersService', () => {
        expect(usersService.create).toHaveBeenCalledWith(userData());
      });

      test('then it should return a product', () => {
        expect(users).toEqual(userData());
      });
    });
  });

  describe('update', () => {
    describe('when update is called', () => {
      let users: User;

      beforeEach(async () => {
        users = await usersController.update(userData().id, userData());
      });

      test('then it should call UsersService', () => {
        expect(usersService.update).toHaveBeenCalledWith(
          userData().id,
          userData(),
        );
      });

      test('then it should return a users', () => {
        expect(users).toEqual(userData());
      });
    });
  });

  describe('remove', () => {
    describe('when remove is called', () => {
      // let users: Product;

      beforeEach(async () => {
        await usersController.remove(userData().id);
      });

      test('then it should call UsersService', () => {
        expect(usersService.remove).toHaveBeenCalledWith(userData().id);
      });

      test('then it should return a users', async () => {
        expect(await usersController.remove(userData().id)).toEqual(
          'Promise resolves with void',
        );
      });
    });
  });
});
