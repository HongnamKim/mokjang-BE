import { ScheduleType } from '../const/schedule-type.enum';
import { TaskStatus } from '../../task/const/task-status.enum';
import { VisitationStatus } from '../../visitation/const/visitation-status.enum';
import { EducationSessionStatus } from '../../educations/education-session/const/education-session-status.enum';
import { EducationTermStatus } from '../../educations/education-term/const/education-term-status.enum';

export class ScheduleDto {
  id: number;
  type: ScheduleType;
  title?: string;
  startDate: Date;
  endDate: Date;
  status:
    | EducationSessionStatus
    | TaskStatus
    | VisitationStatus
    | EducationTermStatus;
  educationTermId?: number;
  educationId?: number;
  educationName?: string;

  constructor(
    id: number,
    type: ScheduleType,
    title: string | undefined,
    startDate: Date,
    endDate: Date,
    status:
      | EducationSessionStatus
      | TaskStatus
      | VisitationStatus
      | EducationTermStatus,
    educationTermId?: number,
    educationId?: number,
    educationName?: string,
  ) {
    this.id = id;
    this.type = type;
    this.title = title;
    this.startDate = startDate;
    this.endDate = endDate;
    this.status = status;
    this.educationTermId = educationTermId;
    this.educationId = educationId;
    this.educationName = educationName;
  }
}
