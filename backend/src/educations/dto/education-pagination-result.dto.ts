import { EducationModel } from '../entity/education.entity';

export class EducationPaginationResultDto {
  constructor(
    public readonly data: EducationModel[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
