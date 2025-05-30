import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { UserModel } from '../entity/user.entity';

export const UserFindOptionsRelations: FindOptionsRelations<UserModel> = {};
export const UserFindOptionsSelect: FindOptionsSelect<UserModel> = {
  id: true,
  name: true,
  mobilePhone: true,
};
