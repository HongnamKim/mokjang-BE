import { MemberModel } from '../../../members/entity/member.entity';
import { DeleteResult, QueryRunner } from 'typeorm';
import { ChurchModel } from '../../../churches/entity/church.entity';

export const IDUMMY_MEMBERS_DOMAIN_SERVICE = Symbol(
  'IDUMMY_MEMBERS_DOMAIN_SERVICE',
);

export interface IDummyMembersDomainService {
  createDummyMembers(
    church: ChurchModel,
    count: number,
    qr?: QueryRunner,
  ): Promise<MemberModel[]>;

  deleteDummyMembersCascade(
    church: ChurchModel,
    qr: QueryRunner,
  ): Promise<DeleteResult>;
}
