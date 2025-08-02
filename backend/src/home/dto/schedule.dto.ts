import { ScheduleType } from '../const/schedule-type.enum';
import { TaskStatus } from '../../task/const/task-status.enum';
import { VisitationStatus } from '../../visitation/const/visitation-status.enum';
import { EducationSessionStatus } from '../../educations/education-session/const/education-session-status.enum';

export class ScheduleDto {
  id: number;
  type: ScheduleType;
  title: string;
  startDate: Date;
  endDate: Date;
  status: EducationSessionStatus | TaskStatus | VisitationStatus;
  educationTermId?: number;
  educationId?: number;

  constructor(
    id: number,
    type: ScheduleType,
    title: string,
    startDate: Date,
    endDate: Date,
    status: EducationSessionStatus | TaskStatus | VisitationStatus,
    educationTermId?: number,
    educationId?: number,
  ) {
    this.id = id;
    this.type = type;
    this.title = title;
    this.startDate = startDate;
    this.endDate = endDate;
    this.status = status;
    this.educationTermId = educationTermId;
    this.educationId = educationId;
  }
}
