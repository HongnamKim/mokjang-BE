import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { MemberModel } from '../../members/entity/member.entity';

export const DefaultMemberRelationOptions: FindOptionsRelations<MemberModel> = {
  group: true,
  //groupRole: true,
  officer: true,
};

export const DefaultMemberSelectOptions: FindOptionsSelect<MemberModel> = {
  id: true,
  name: true,
  groupRole: true,
  group: {
    id: true,
    name: true,
  },
  /*groupRole: {
    id: true,
    role: true,
  },*/
  officer: {
    id: true,
    name: true,
  },
};
