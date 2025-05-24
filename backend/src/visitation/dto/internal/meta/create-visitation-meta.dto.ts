import { VisitationMethod } from '../../../const/visitation-method.enum';
import { VisitationType } from '../../../const/visitation-type.enum';
import { VisitationStatus } from '../../../const/visitation-status.enum';
import { MemberModel } from '../../../../members/entity/member.entity';

export class CreateVisitationMetaDto {
  status: VisitationStatus;

  visitationMethod: VisitationMethod;

  visitationType: VisitationType;

  title: string;

  inCharge: MemberModel;

  startDate: Date;

  endDate: Date;

  creator: MemberModel;
}
