import { EducationEnrollmentModel } from '../../entity/education-enrollment.entity';
import { BasePostResponseDto } from '../../../../common/dto/reponse/base-post-response.dto';

export class PostEducationEnrollmentsResponseDto extends BasePostResponseDto<
  EducationEnrollmentModel[]
> {
  constructor(data: EducationEnrollmentModel[]) {
    super(data);
  }
}
