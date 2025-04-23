import { CreateMemberDto } from '../../dto/create-member.dto';
import { MemberModel } from '../../entity/member.entity';
import { QueryRunner } from 'typeorm';

export const IDUMMY_MEMBERS_DOMAIN_SERVICE = Symbol(
  'IDUMMY_MEMBERS_DOMAIN_SERVICE',
);

export interface IDummyMembersDomainService {
  createDummyMemberModel(
    dto: CreateMemberDto & { churchId: number },
  ): MemberModel;

  createDummyMembers(
    members: MemberModel[],
    qr?: QueryRunner,
  ): Promise<MemberModel[]>;
}
