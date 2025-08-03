import { EducationSessionModel } from '../../entity/education-session.entity';

export class EducationSessionPaginationResponseDto {
  constructor(
    public readonly data: EducationSessionModel[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
