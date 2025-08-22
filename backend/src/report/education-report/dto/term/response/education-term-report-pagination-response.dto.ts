import { EducationReportModel } from '../../../entity/education-report.entity';

export class EducationTermReportPaginationResponseDto {
  constructor(
    public readonly data: EducationReportModel[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
