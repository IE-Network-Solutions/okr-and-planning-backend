import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

//import { MockProxy } from 'jest-mock-extended';
// import { Repository } from 'typeorm';
import { PermissionService } from './permission.service';
import { Permission } from './entities/permission.entity';
import { createpermissionData, permissionData } from './tests/permission.data';
import { NotFoundException } from '@nestjs/common';
jest.mock('./permission.service');
describe('PermissionService', () => {
  let permissionService: PermissionService;
  // let permissionRepository: MockProxy<Repository<Permission>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PermissionService,
        {
          provide: getRepositoryToken(Permission),
          useValue: PermissionService,
          // useValue: mockDeep<Repository<Permission>>(),
        },
      ],
    }).compile();

    permissionService = moduleRef.get<PermissionService>(PermissionService);
    // permissionRepository = moduleRef.get(getRepositoryToken(Permission));
  });

  describe('findOne', () => {
    describe('when findOne is called', () => {
      let permission: Permission;

      beforeEach(async () => {
        permission = await permissionService.findOne(permissionData().id);
      });

      test('then it should call permissionService.findOne with the correct id', async () => {
        await expect(permissionService.findOne).toHaveBeenCalledWith(
          permissionData().id,
        );
      });

      test('then it should return permission', () => {
        expect(permission).toEqual(permissionData());
      });
      test('it should throw not found exception if id is not found', async () => {
        const wrongId = '4567';
        await expect(permissionService.findOne(wrongId)).rejects.toThrow(
          NotFoundException,
        );
        // await expect(permission).rejects.toThrow(NotFoundException)
      });
    });
  });

  describe('findAll', () => {
    describe('when findAll is called', () => {
      let permission: Permission[];

      beforeEach(async () => {
        permission = await permissionService.findAll();
      });

      test('then it should call permissionService.findAll', async () => {
        await expect(permissionService.findAll).toHaveBeenCalledWith();
      });

      test('then it should return permission', () => {
        expect(permission).toEqual([permissionData()]);
      });
    });
  });

  describe('create', () => {
    describe('when create is called', () => {
      let permission: Permission;

      beforeEach(async () => {
        permission = await permissionService.create(createpermissionData());
      });

      test('then it should call permissionService.create', async () => {
        await expect(permissionService.create).toHaveBeenCalledWith(
          createpermissionData(),
        );
      });
      // test('then it should call permissionService.save', async () => {
      //   await expect(permissionService.save).toHaveBeenCalledWith(createpermissionData());
      // })

      test('then it should return permission', () => {
        expect(permission).toEqual(permissionData());
      });
    });
  });

  describe('update', () => {
    describe('when update is called', () => {
      let permission: Permission;

      beforeEach(async () => {
        permission = await permissionService.update(
          permissionData().id,
          permissionData(),
        );
      });

      test('then it should call permissionService.update', async () => {
        await expect(permissionService.update).toHaveBeenCalledWith(
          permissionData().id,
          permissionData(),
        );
      });
      test('it should throw Permission with id ${id} not found. if id is not found', async () => {
        const wrongId = '4567';
        await expect(
          permissionService.update(wrongId, permissionData()),
        ).rejects.toThrow(`Permission with id ${wrongId} not found.`);
        // await expect(permission).rejects.toThrow(NotFoundException)
      });

      test('then it should return permission', () => {
        expect(permission).toEqual(permissionData());
      });
    });
  });

  describe('remove', () => {
    describe('when remove is called', () => {
      let permission: Permission;

      beforeEach(async () => {
        permission = await permissionService.remove(permissionData().id);
      });

      test('then it should call permissionService.remove', async () => {
        await expect(permissionService.remove).toHaveBeenCalledWith(
          permissionData().id,
        );
      });
      test('it should throw Permission with id ${id} not found. if id is not found', async () => {
        const wrongId = '4567';
        await expect(permissionService.remove(wrongId)).rejects.toThrow(
          `Permission with id ${wrongId} not found.`,
        );
        // await expect(permission).rejects.toThrow(NotFoundException)
      });

      test('then it should return permission', () => {
        expect(permission).toEqual('Promise resolves with void');
      });
    });
  });

  // describe('createPermission', () => {
  //   it('should create a permission', async () => {
  //     const permission = new Permission();
  //     permission.name = 'permission1';
  //     permission.slug = 'permission1';

  //     permissionRepository.create.mockReturnValue(permission);
  //     permissionRepository.save.mockResolvedValue(permission);

  //     const result = await permissionService.create(permission);

  //     expect(result).toBe(permission);
  //     expect(permissionRepository.create).toHaveBeenCalledWith(permission);
  //   });
  // });

  // describe('updatePermission', () => {

  //   it('should update a permission', async () => {
  //     const permission = new Permission();
  //     permission.id = '0be46f14-46f5-44c6-805f-f6ab515ee61c';
  //     permission.name = 'permission1';
  //     permission.slug = 'permission1';

  //     const updatedPermission = { ...permission, name: 'updatedPermission' };
  //     permissionRepository.findOne.mockResolvedValue(permission);
  //     permissionRepository.save.mockResolvedValue(updatedPermission);

  //     const result = await permissionService.update(
  //       permission.id,
  //       updatedPermission,
  //     );

  //     expect(result).toBe(updatedPermission);
  //     expect(permissionRepository.findOne).toHaveBeenCalledWith({
  //       where: { id: permission.id },
  //     });
  //     expect(permissionRepository.save).toHaveBeenCalledWith(permission);
  //   });
  // });

  // describe('deletePermissionById', () => {
  //   it('should delete a permission on remove', async () => {
  //     const id = '1';
  //     const permission = new Permission();
  //     permission.id = id;
  //     permissionRepository.findOne.mockResolvedValue(permission);
  //     permissionRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

  //     const result = await permissionService.remove(id);

  //     expect(result).toEqual({ affected: 1, raw: {} });
  //     expect(permissionRepository.findOne).toHaveBeenCalledWith({
  //       where: { id: permission.id },
  //     });
  //     expect(permissionRepository.delete).toHaveBeenCalledWith(id);
  //   });
  // });

  // describe('getPermissionById', () => {
  //   it('should return a permission by id', async () => {
  //     const id = '1';
  //     const expectedPermission = new Permission();
  //     expectedPermission.id = id;
  //     expectedPermission.name = 'permission1';

  //     permissionRepository.findOneBy.mockResolvedValue(expectedPermission);

  //     const result = await permissionService.findOne(id);

  //     expect(result).toEqual(expectedPermission);
  //     expect(permissionRepository.findOneBy).toHaveBeenCalledWith({ id });
  //   });

  //   it('should return undefined if no permission is found with the given id', async () => {
  //     const id = '1';

  //     permissionRepository.findOneBy.mockResolvedValue(undefined);

  //     const result = await permissionService.findOne(id);

  //     expect(result).toBeUndefined();
  //     expect(permissionRepository.findOneBy).toHaveBeenCalledWith({ id });
  //   });
  // });
});
