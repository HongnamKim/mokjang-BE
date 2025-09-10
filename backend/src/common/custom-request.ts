import { Request } from 'express';
import { ChurchModel } from '../churches/entity/church.entity';
import { WorshipModel } from '../worship/entity/worship.entity';
import { ChurchUserModel } from '../church-user/entity/church-user.entity';
import { JwtAccessPayload } from '../auth/type/jwt';
import { MemberModel } from '../members/entity/member.entity';
import { QueryRunner } from 'typeorm';
import { UserModel } from '../user/entity/user.entity';

export interface CustomRequest extends Request {
  queryRunner: QueryRunner;

  church: ChurchModel;
  worship: WorshipModel;
  requestChurchUser: ChurchUserModel;
  requestManager: ChurchUserModel;
  requestOwner: ChurchUserModel;
  permissionScopeGroupIds: number[];
  tokenPayload: JwtAccessPayload;
  user: UserModel;

  targetMember: MemberModel;

  worshipTargetGroupIds: number[] | undefined;
}
