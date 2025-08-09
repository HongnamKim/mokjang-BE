import { EducationTermReportModel } from '../../../entity/education-term-report.entity';

export class EducationTermReportPaginationResponseDto {
  constructor(
    public readonly data: EducationTermReportModel[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
