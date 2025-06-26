import { VisitationMethod } from '../../../const/visitation-method.enum';
import { VisitationType } from '../../../const/visitation-type.enum';
import { VisitationStatus } from '../../../const/visitation-status.enum';
import { ChurchUserModel } from '../../../../church-user/entity/church-user.entity';

export class CreateVisitationMetaDto {
  status: VisitationStatus;

  visitationMethod: VisitationMethod;

  visitationType: VisitationType;

  title: string;

  inCharge: ChurchUserModel; //MemberModel;

  startDate: Date;

  endDate: Date;

  creator: ChurchUserModel; //MemberModel;
}
