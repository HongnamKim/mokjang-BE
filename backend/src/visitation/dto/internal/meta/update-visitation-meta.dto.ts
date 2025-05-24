import { VisitationStatus } from '../../../const/visitation-status.enum';
import { VisitationMethod } from '../../../const/visitation-method.enum';
import { VisitationType } from '../../../const/visitation-type.enum';
import { MemberModel } from '../../../../members/entity/member.entity';

export class UpdateVisitationMetaDto {
  status?: VisitationStatus;

  visitationMethod?: VisitationMethod;

  visitationType?: VisitationType;

  title?: string;

  inCharge?: MemberModel;

  startDate?: Date;
  endDate?: Date;
}
