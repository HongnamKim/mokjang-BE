import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import {
  MemberSimpleSelect,
  MemberSummarizedRelation,
} from '../../members/const/member-find-options.const';

export const ManagersFindOptionsRelations: FindOptionsRelations<ChurchUserModel> =
  {
    member: MemberSummarizedRelation,
    user: true,
    permissionTemplate: true,
    permissionScopes: { group: true },
  };

export const ManagersFindOptionsSelect: FindOptionsSelect<ChurchUserModel> = {
  member: MemberSimpleSelect,
  user: {
    id: true,
    name: true,
    mobilePhone: true,
    role: true,
  },
  permissionTemplate: {
    id: true,
    title: true,
  },
  permissionScopes: {
    id: true,
    isAllGroups: true,
    group: {
      id: true,
      name: true,
    },
  },
};

export const ManagerFindOptionsRelations: FindOptionsRelations<ChurchUserModel> =
  {
    member: MemberSummarizedRelation,
    permissionTemplate: { permissionUnits: true },
    user: true,
    permissionScopes: { group: true },
  };

export const ManagerFindOptionsSelect: FindOptionsSelect<ChurchUserModel> = {
  member: MemberSimpleSelect,
  user: {
    id: true,
    name: true,
    mobilePhone: true,
  },
  permissionScopes: {
    id: true,
    isAllGroups: true,
    group: {
      id: true,
      name: true,
    },
  },
};
