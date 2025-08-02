import { Injectable } from '@nestjs/common';
import { IEducationMembersDomainService } from '../interface/education-members-domain.service.interface';
import { EducationTermModel } from '../../../educations/education-term/entity/education-term.entity';
import { QueryRunner, Repository } from 'typeorm';
import { MemberModel } from '../../entity/member.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  MemberSummarizedGroupSelectQB,
  MemberSummarizedOfficerSelectQB,
  MemberSummarizedSelectQB,
} from '../../const/member-find-options.const';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { GetNotEnrolledMembersDto } from '../../../educations/education-enrollment/dto/request/get-not-enrolled-members.dto';

@Injectable()
export class EducationMembersDomainService
  implements IEducationMembersDomainService
{
  constructor(
    @InjectRepository(MemberModel)
    private readonly repository: Repository<MemberModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(MemberModel) : this.repository;
  }

  findNotEnrolledMembers(
    church: ChurchModel,
    educationTerm: EducationTermModel,
    dto: GetNotEnrolledMembersDto,
    qr?: QueryRunner,
  ): Promise<MemberModel[]> {
    const repository = this.getRepository(qr);

    return repository
      .createQueryBuilder('member')
      .leftJoin('member.officer', 'officer')
      .leftJoin('member.group', 'group')
      .select(MemberSummarizedSelectQB)
      .addSelect(MemberSummarizedOfficerSelectQB)
      .addSelect(MemberSummarizedGroupSelectQB)
      .leftJoin(
        'member.educationEnrollments',
        'enrollment',
        'enrollment.educationTermId IN (SELECT id FROM education_term_model WHERE "educationId" = :educationId AND id != :currentTermId)',
        {
          educationId: educationTerm.educationId,
          currentTermId: educationTerm.id,
        },
      )
      .addSelect([
        'enrollment.id',
        'enrollment.status',
        'enrollment.createdAt',
        'enrollment.updatedAt',
      ])
      .leftJoin('enrollment.educationTerm', 'educationTerm')
      .addSelect([
        'educationTerm.id',
        'educationTerm.createdAt',
        'educationTerm.updatedAt',
        'educationTerm.educationId',
        'educationTerm.educationName',
        'educationTerm.term',
      ])
      .where('member.churchId = :churchId', { churchId: church.id })
      .andWhere(
        `NOT EXISTS (
          SELECT 1
          FROM education_enrollment_model ee
          WHERE ee."memberId" = member.id
          AND ee."educationTermId" = :educationTermId
          )`,
        { educationTermId: educationTerm.id },
      )
      .andWhere('member.name ILIKE :name', { name: `%${dto.name}%` })
      .orderBy(`member.${dto.order}`, dto.orderDirection)
      .limit(dto.take)
      .offset(dto.take * (dto.page - 1))
      .getMany();
  }
}
