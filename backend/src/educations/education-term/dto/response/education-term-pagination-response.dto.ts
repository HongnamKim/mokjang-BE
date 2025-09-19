import { EducationTermModel } from '../../entity/education-term.entity';
import { BaseOffsetPaginationResponseDto } from '../../../../common/dto/reponse/base-offset-pagination-response.dto';

export class EducationTermPaginationResponseDto {
  constructor(
    public readonly data: EducationTermModel[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
