import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { MemberModel } from '../../members/entity/member.entity';
import {
  MemberSummarizedRelation,
  MemberSummarizedSelect,
} from '../../members/const/member-find-options.const';

export const ManagersFindOptionsRelations: FindOptionsRelations<MemberModel> = {
  ...MemberSummarizedRelation,
  permissionTemplate: true,
  user: true,
};

export const ManagersFindOptionsSelect: FindOptionsSelect<MemberModel> = {
  ...MemberSummarizedSelect,
  isPermissionActive: true,
  permissionTemplate: {
    id: true,
    title: true,
  },
  user: {
    //churchJoinedAt: true,
    role: true,
  },
};

export const ManagerFindOptionsRelations: FindOptionsRelations<MemberModel> = {
  ...MemberSummarizedRelation,
  permissionTemplate: { permissionUnits: true },
  user: true,
};

export const ManagerFindOptionsSelect: FindOptionsSelect<MemberModel> = {
  ...MemberSummarizedSelect,
  isPermissionActive: true,
  permissionTemplate: {
    id: true,
    title: true,
    permissionUnits: true,
  },
  user: {
    //churchJoinedAt: true,
    role: true,
  },
};
