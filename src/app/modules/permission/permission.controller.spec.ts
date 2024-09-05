import { Test } from '@nestjs/testing';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { Permission } from './entities/permission.entity';
// import { CreatePermissionDto } from './dto/create-permission.dto';
import { createpermissionData, permissionData } from './tests/permission.data';
import { UpdatePermissionDto } from './dto/update-permission.dto';
jest.mock('./permission.service');

describe('PermissionController', () => {
  let permissionController: PermissionController;
  let permissionService: PermissionService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [PermissionController],
      providers: [PermissionService],
    }).compile();

    permissionController =
      moduleRef.get<PermissionController>(PermissionController);
    permissionService = moduleRef.get<PermissionService>(PermissionService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    describe('when findAll is called', () => {
      let permissions: Permission[];

      beforeEach(async () => {
        permissions = await permissionController.findAll();
      });

      test('then it should call permissionService', () => {
        expect(permissionService.findAll).toHaveBeenCalled();
      });

      test('then is should return a permissions', () => {
        expect(permissions).toEqual([permissionData()]);
      });
    });
  });

  describe('findOne', () => {
    describe('when findOne is called', () => {
      let permission: Permission;

      beforeEach(async () => {
        permission = await permissionController.findOne(permissionData().id);
      });

      test('then it should call permissonService', () => {
        expect(permissionService.findOne).toHaveBeenCalledWith(
          permissionData().id,
        );
      });

      test('then it should return permission', () => {
        expect(permission).toEqual(permissionData());
      });
    });
  });

  describe('create', () => {
    describe('when create is called', () => {
      let permission: Permission;
      // let createPermissionDto: CreatePermissionDto;

      beforeEach(async () => {
        // createPermissionDto = {
        //   name: permissionData().name,
        //   slug: permissionData().slug,
        // };
        permission = await permissionController.create(createpermissionData());
      });

      test('then it should call permissionService', () => {
        expect(permissionService.create).toHaveBeenCalledWith(
          createpermissionData(),
        );
      });

      test('then it should return a permisson', () => {
        expect(permission).toEqual(permissionData());
      });
    });
  });

  describe('update', () => {
    describe('when update is called', () => {
      let permission: Permission;
      let updatePermissionDto: UpdatePermissionDto;

      beforeEach(async () => {
        updatePermissionDto = {
          name: 'update product',
          slug: 'update_product',
        };
        permission = await permissionController.update(
          permissionData().id,
          updatePermissionDto,
        );
      });

      test('then it should call permissionService', () => {
        expect(permissionService.update).toHaveBeenCalledWith(
          permissionData().id,
          updatePermissionDto,
        );
      });

      test('then it should return a permission', () => {
        expect(permission).toEqual(permissionData());
      });
    });
  });

  describe('remove', () => {
    describe('when remove is called', () => {
      let permission: Permission;

      beforeEach(async () => {
        permission = await permissionController.remove(permissionData().id);
      });

      test('then it should call permissionService', () => {
        expect(permissionService.remove).toHaveBeenCalledWith(
          permissionData().id,
        );
      });

      test('then it should return a permission', () => {
        expect(permission).toEqual('Promise resolves with void');
      });
    });
  });
});
