import { EducationReportModel } from '../../../entity/education-report.entity';

export class EducationSessionReportPaginationResultDto {
  constructor(
    public readonly data: EducationReportModel[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
