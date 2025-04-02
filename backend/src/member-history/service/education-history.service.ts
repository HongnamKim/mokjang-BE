import { Inject, Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { GetEducationHistoryDto } from '../dto/education/get-education-history.dto';
import { EducationEnrollmentModel } from '../../management/educations/entity/education-enrollment.entity';
import { EducationStatus } from '../../management/educations/const/education-status.enum';
import {
  IEDUCATION_HISTORY_DOMAIN_SERVICE,
  IEducationHistoryDomainService,
} from '../member-history-domain/service/interface/education-history-domain.service.interface';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../members/member-domain/service/interface/members-domain.service.interface';
import { EducationHistoryPaginationResultDto } from '../dto/education/education-history-pagination-result.dto';

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

    const result: EducationHistoryPaginationResultDto = {
      data: educationHistories,
      totalCount,
      count: educationHistories.length,
      page: dto.page,
      totalPage,
      ...this.getEducationStatusCount(educationHistories),
    };

    return result;
  }

  private getEducationStatusCount(enrollments: EducationEnrollmentModel[]) {
    return enrollments.reduce(
      (acc, enrollment) => ({
        inProgressCount:
          acc.inProgressCount +
          (enrollment.status === EducationStatus.IN_PROGRESS ? 1 : 0),
        completedCount:
          acc.completedCount +
          (enrollment.status === EducationStatus.COMPLETED ? 1 : 0),
        incompleteCount:
          acc.incompleteCount +
          (enrollment.status === EducationStatus.INCOMPLETE ? 1 : 0),
      }),
      { inProgressCount: 0, completedCount: 0, incompleteCount: 0 },
    );
  }
}
