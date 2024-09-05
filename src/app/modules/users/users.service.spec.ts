import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

// import { MockProxy } from 'jest-mock-extended';

import { NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { userData } from './tests/user.data';
// import { Repository } from 'typeorm';

jest.mock('./users.service');
describe('usersService', () => {
  let usersService: UsersService;
  //let usersRepository: MockProxy<Repository<User>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: UsersService,
          // useValue: mockDeep<Repository<Users>>(),
        },
      ],
    }).compile();

    usersService = moduleRef.get<UsersService>(UsersService);
    //  usersRepository = moduleRef.get(getRepositoryToken(User));
  });

  describe('findOne', () => {
    describe('when findOne is called', () => {
      let users: User;

      beforeEach(async () => {
        users = await usersService.findOne(userData().id);
      });

      test('then it should call usersService.findOne with the correct id', async () => {
        await expect(usersService.findOne).toHaveBeenCalledWith(userData().id);
      });

      test('then it should return Users', () => {
        expect(users).toEqual(userData());
      });
      test('it should throw not found exception if id is not found', async () => {
        const wrongId = '4567';
        await expect(usersService.findOne(wrongId)).rejects.toThrow(
          NotFoundException,
        );
        // await expect(Users).rejects.toThrow(NotFoundException)
      });
    });
  });

  // describe('findAll', () => {
  //   describe('when findAll is called', () => {
  //     let Users: User[];
  //     const options = { page: 1, limit: 10 };

  //     beforeEach(async () => {
  //       await usersService.findAll(options);
  //     });

  //     test('then it should call usersService.findAll', async () => {
  //       await expect(usersService.findAll).toHaveBeenCalledWith(options);
  //     });

  //     test('then it should return Users', async () => {
  //       expect(await usersService.findAll(options)).toEqual(paginationResult());
  //     });
  //   });
  // });

  describe('create', () => {
    describe('when create is called', () => {
      let users: User;

      beforeEach(async () => {
        users = await usersService.create(userData());
      });

      test('then it should call usersService.create', async () => {
        await expect(usersService.create).toHaveBeenCalledWith(userData());
      });
      // test('then it should call usersService.save', async () => {
      //   await expect(usersService.save).toHaveBeenCalledWith(createUsersData());
      // })

      test('then it should return Users', () => {
        expect(users).toEqual(userData());
      });
    });
  });

  describe('update', () => {
    describe('when update is called', () => {
      let users: User;

      beforeEach(async () => {
        users = await usersService.update(userData().id, userData());
      });

      test('then it should call usersService.update', async () => {
        await expect(usersService.update).toHaveBeenCalledWith(
          userData().id,
          userData(),
        );
      });
      test('it should throw User with id ${id} not found. if id is not found', async () => {
        const wrongId = '4567';
        await expect(usersService.update(wrongId, userData())).rejects.toThrow(
          `User with id ${wrongId} not found.`,
        );
        // await expect(Users).rejects.toThrow(NotFoundException)
      });

      test('then it should return Users', () => {
        expect(users).toEqual(userData());
      });
    });
  });

  describe('remove', () => {
    describe('when remove is called', () => {
      // let users: User;

      beforeEach(async () => {
        await usersService.remove(userData().id);
      });

      test('then it should call usersService.remove', async () => {
        await expect(usersService.remove).toHaveBeenCalledWith(userData().id);
      });
      test('it should throw User with id ${id} not found. if id is not found', async () => {
        const wrongId = '4567';
        await expect(usersService.remove(wrongId)).rejects.toThrow(
          `User with id ${wrongId} not found.`,
        );
        // await expect(Users).rejects.toThrow(NotFoundException)
      });

      test('then it should return Users', async () => {
        expect(await usersService.remove(userData().id)).toEqual(
          'Promise resolves with void',
        );
      });
    });
  });
});
