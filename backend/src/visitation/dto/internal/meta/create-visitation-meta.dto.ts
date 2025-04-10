import { VisitationMethod } from '../../../const/visitation-method.enum';
import { VisitationType } from '../../../const/visitation-type.enum';
import { VisitationStatus } from '../../../const/visitation-status.enum';
import { MemberModel } from '../../../../members/entity/member.entity';

export class CreateVisitationMetaDto {
  visitationStatus: VisitationStatus;

  visitationMethod: VisitationMethod;

  visitationType: VisitationType;

  visitationTitle: string;

  instructor: MemberModel;

  visitationDate: Date;

  creator: MemberModel;
}
