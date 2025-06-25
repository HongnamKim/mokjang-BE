import { Injectable } from '@nestjs/common';
import { IWorshipEnrollmentDomainService } from '../interface/worship-enrollment-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { WorshipEnrollmentModel } from '../../entity/worship-enrollment.entity';
import {
  FindOptionsOrder,
  FindOptionsWhere,
  In,
  QueryRunner,
  Repository,
} from 'typeorm';
import { WorshipModel } from '../../entity/worship.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { GetWorshipEnrollmentsDto } from '../../dto/request/worship-enrollment/get-worship-enrollments.dto';
import { WorshipEnrollmentDomainPaginationResultDto } from '../dto/worship-enrollment-domain-pagination-result.dto';
import {
  MemberSummarizedRelation,
  MemberSummarizedSelect,
} from '../../../members/const/member-find-options.const';
import { WorshipEnrollmentOrderEnum } from '../../const/worship-enrollment-order.enum';

@Injectable()
export class WorshipEnrollmentDomainService
  implements IWorshipEnrollmentDomainService
{
  constructor(
    @InjectRepository(WorshipEnrollmentModel)
    private readonly repository: Repository<WorshipEnrollmentModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(WorshipEnrollmentModel)
      : this.repository;
  }

  private parseOrderOption(dto: GetWorshipEnrollmentsDto) {
    if (dto.order === WorshipEnrollmentOrderEnum.NAME) {
      const orderOptions: FindOptionsOrder<WorshipEnrollmentModel> = {
        member: {
          name: dto.orderDirection,
        },
      };

      return orderOptions;
    } else if (dto.order === WorshipEnrollmentOrderEnum.GROUP_NAME) {
      const orderOptions: FindOptionsOrder<WorshipEnrollmentModel> = {
        member: {
          group: {
            name: dto.orderDirection,
          },
          name: dto.orderDirection,
        },
      };

      return orderOptions;
    } else {
      const orderOptions: FindOptionsOrder<WorshipEnrollmentModel> = {
        [dto.order]: dto.orderDirection,
      };

      return orderOptions;
    }
  }

  async findEnrollments(
    worship: WorshipModel,
    dto: GetWorshipEnrollmentsDto,
    groupIds?: number[],
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const whereOptions: FindOptionsWhere<WorshipEnrollmentModel> = {
      worshipId: worship.id,
      member: {
        groupId: groupIds && In(groupIds),
      },
    };

    const orderOptions: FindOptionsOrder<WorshipEnrollmentModel> =
      this.parseOrderOption(dto);

    if (dto.order !== WorshipEnrollmentOrderEnum.ID) {
      orderOptions.id = 'ASC';
    }

    const [data, totalCount] = await Promise.all([
      repository.find({
        where: whereOptions,
        order: orderOptions,
        relations: {
          member: MemberSummarizedRelation,
        },
        select: {
          member: MemberSummarizedSelect,
        },
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),
      repository.count({
        where: whereOptions,
      }),
    ]);

    return new WorshipEnrollmentDomainPaginationResultDto(data, totalCount);
  }

  async findAllEnrollments(
    worship: WorshipModel,
    qr?: QueryRunner,
  ): Promise<WorshipEnrollmentModel[]> {
    const repository = this.getRepository(qr);

    return repository.find({
      where: {
        worshipId: worship.id,
      },
    });
  }

  async refreshEnrollments(
    worship: WorshipModel,
    members: MemberModel[],
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const enrollments = repository.create(
      members.map((member) => ({
        worshipId: worship.id,
        memberId: member.id,
      })),
    );

    return repository.save(enrollments, { chunk: 100 });
  }

  async createEnrollmentCascade(
    newWorship: WorshipModel,
    members: MemberModel[],
    qr: QueryRunner,
  ): Promise<WorshipEnrollmentModel[]> {
    const repository = this.getRepository(qr);

    const newEnrollments = repository.create(
      members.map((member) => ({
        memberId: member.id,
        worshipId: newWorship.id,
      })),
    );

    return repository.save(newEnrollments, { chunk: 100 });
  }

  async deleteEnrollmentCascade(deletedWorship: WorshipModel, qr: QueryRunner) {
    const repository = this.getRepository(qr);

    return repository.softDelete({
      worshipId: deletedWorship.id,
    });
  }

  async incrementPresentCount(
    enrollment: WorshipEnrollmentModel,
    qr: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    return repository.increment({ id: enrollment.id }, 'presentCount', 1);
  }

  async decrementPresentCount(
    enrollment: WorshipEnrollmentModel,
    qr: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    return repository.decrement({ id: enrollment.id }, 'presentCount', 1);
  }

  async incrementAbsentCount(
    enrollment: WorshipEnrollmentModel,
    qr: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    return repository.increment({ id: enrollment.id }, 'absentCount', 1);
  }

  async decrementAbsentCount(
    enrollment: WorshipEnrollmentModel,
    qr: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    return repository.decrement({ id: enrollment.id }, 'absentCount', 1);
  }
}
