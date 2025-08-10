import { Request } from 'express';
import { ChurchModel } from '../churches/entity/church.entity';
import { WorshipModel } from '../worship/entity/worship.entity';
import { ChurchUserModel } from '../church-user/entity/church-user.entity';
import { JwtAccessPayload } from '../auth/type/jwt';

export interface CustomRequest extends Request {
  church: ChurchModel;
  worship: WorshipModel;
  requestChurchUser: ChurchUserModel;
  requestManager: ChurchUserModel;
  permissionScopeGroupIds: number[];
  tokenPayload: JwtAccessPayload;
}
