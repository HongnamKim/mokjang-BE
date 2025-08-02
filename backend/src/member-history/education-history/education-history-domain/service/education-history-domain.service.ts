import { Injectable } from '@nestjs/common';
import { IEducationHistoryDomainService } from '../interface/education-history-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, QueryRunner, Repository } from 'typeorm';
import { MemberModel } from '../../../../members/entity/member.entity';
import { GetEducationHistoryDto } from '../../dto/get-education-history.dto';
import { EducationEnrollmentModel } from '../../../../educations/education-enrollment/entity/education-enrollment.entity';

@Injectable()
export class EducationHistoryDomainService
  implements IEducationHistoryDomainService
{
  constructor(
    @InjectRepository(EducationEnrollmentModel)
    private readonly educationEnrollmentsRepository: Repository<EducationEnrollmentModel>,
  ) {}

  private getEducationEnrollmentsRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationEnrollmentModel)
      : this.educationEnrollmentsRepository;
  }

  async paginateEducationHistory(
    member: MemberModel,
    dto: GetEducationHistoryDto,
    qr?: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    const findOptionsWhere: FindOptionsWhere<EducationEnrollmentModel> = {
      memberId: member.id,
      status: dto.status,
    };

    const [educationHistories, totalCount] = await Promise.all([
      educationEnrollmentsRepository.find({
        where: findOptionsWhere,
        relations: {
          educationTerm: true,
        },
        order: {
          educationTerm: {
            endDate: dto.orderDirection,
            startDate: dto.orderDirection,
          },
        },
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),
      educationEnrollmentsRepository.count({
        where: findOptionsWhere,
      }),
    ]);

    return { educationHistories, totalCount };
  }
}
