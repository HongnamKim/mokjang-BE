import { Inject, Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { GetEducationHistoryDto } from '../dto/get-education-history.dto';
import { EducationEnrollmentModel } from '../../../management/educations/entity/education-enrollment.entity';
import { EducationEnrollmentStatus } from '../../../management/educations/const/education-status.enum';
import {
  IEDUCATION_HISTORY_DOMAIN_SERVICE,
  IEducationHistoryDomainService,
} from '../education-history-domain/interface/education-history-domain.service.interface';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../../members/member-domain/interface/members-domain.service.interface';
import { EducationHistoryPaginationResultDto } from '../dto/education-history-pagination-result.dto';

@Injectable()
export class EducationHistoryService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,
    @Inject(IEDUCATION_HISTORY_DOMAIN_SERVICE)
    private readonly educationHistoryDomainService: IEducationHistoryDomainService,
  ) {}

  async getMemberEducationEnrollments(
    churchId: number,
    memberId: number,
    dto: GetEducationHistoryDto,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );
    const member = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
      qr,
    );

    const { educationHistories, totalCount } =
      await this.educationHistoryDomainService.paginateEducationHistory(
        member,
        dto,
        qr,
      );

    const totalPage = Math.ceil(totalCount / dto.take);

    const educationStatusCount =
      this.getEducationStatusCount(educationHistories);

    return new EducationHistoryPaginationResultDto(
      educationHistories,
      totalCount,
      educationHistories.length,
      dto.page,
      totalPage,
      educationStatusCount.inProgressCount,
      educationStatusCount.completedCount,
      educationStatusCount.incompleteCount,
    );
  }

  private getEducationStatusCount(enrollments: EducationEnrollmentModel[]) {
    return enrollments.reduce(
      (acc, enrollment) => ({
        inProgressCount:
          acc.inProgressCount +
          (enrollment.status === EducationEnrollmentStatus.IN_PROGRESS ? 1 : 0),
        completedCount:
          acc.completedCount +
          (enrollment.status === EducationEnrollmentStatus.COMPLETED ? 1 : 0),
        incompleteCount:
          acc.incompleteCount +
          (enrollment.status === EducationEnrollmentStatus.INCOMPLETE ? 1 : 0),
      }),
      { inProgressCount: 0, completedCount: 0, incompleteCount: 0 },
    );
  }
}
