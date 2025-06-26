import { VisitationStatus } from '../../../const/visitation-status.enum';
import { VisitationMethod } from '../../../const/visitation-method.enum';
import { VisitationType } from '../../../const/visitation-type.enum';
import { ChurchUserModel } from '../../../../church-user/entity/church-user.entity';

export class UpdateVisitationMetaDto {
  status?: VisitationStatus;

  visitationMethod?: VisitationMethod;

  visitationType?: VisitationType;

  title?: string;

  inCharge?: ChurchUserModel;

  startDate?: Date;
  endDate?: Date;
}
