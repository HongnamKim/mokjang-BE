import { Request } from 'express';
import { ChurchModel } from '../churches/entity/church.entity';
import { WorshipModel } from '../worship/entity/worship.entity';
import { ChurchUserModel } from '../church-user/entity/church-user.entity';
import { JwtAccessPayload } from '../auth/type/jwt';
import { MemberModel } from '../members/entity/member.entity';
import { QueryRunner } from 'typeorm';
import { UserModel } from '../user/entity/user.entity';
import { VisitationMetaModel } from '../visitation/entity/visitation-meta.entity';

export interface CustomRequest extends Request {
  queryRunner: QueryRunner;

  church: ChurchModel;
  worship: WorshipModel;
  requestChurchUser: ChurchUserModel;
  requestManager: ChurchUserModel;
  requestOwner: ChurchUserModel;
  permissionScopeGroupIds: number[]; // 요청자의 권한 범위 내 모든 그룹 ID
  tokenPayload: JwtAccessPayload;
  user: UserModel;

  targetMember: MemberModel;
  targetVisitation: VisitationMetaModel;

  worshipTargetGroupIds: number[] | undefined;
}
