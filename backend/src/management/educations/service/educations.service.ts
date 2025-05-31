import { Inject, Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { GetEducationDto } from '../dto/education/get-education.dto';
import { CreateEducationDto } from '../dto/education/create-education.dto';
import { UpdateEducationDto } from '../dto/education/update-education.dto';
import {
  IEDUCATION_DOMAIN_SERVICE,
  IEducationDomainService,
} from './education-domain/interface/education-domain.service.interface';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IEDUCATION_TERM_DOMAIN_SERVICE,
  IEducationTermDomainService,
} from './education-domain/interface/education-term-domain.service.interface';
import { EducationPaginationResultDto } from '../dto/education-pagination-result.dto';
import { EducationDeleteResponseDto } from '../dto/education/response/education-delete-response.dto';
import {
  IMANAGER_DOMAIN_SERVICE,
  IManagerDomainService,
} from '../../../manager/manager-domain/service/interface/manager-domain.service.interface';

@Injectable()
export class EducationsService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchDomainService: IChurchesDomainService,
    /*@Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,*/
    @Inject(IMANAGER_DOMAIN_SERVICE)
    private readonly managerDomainService: IManagerDomainService,

    @Inject(IEDUCATION_DOMAIN_SERVICE)
    private readonly educationDomainService: IEducationDomainService,
    @Inject(IEDUCATION_TERM_DOMAIN_SERVICE)
    private readonly educationTermDomainService: IEducationTermDomainService,
  ) {}

  async getEducations(
    churchId: number,
    dto: GetEducationDto,
    qr?: QueryRunner,
  ) {
    const church = await this.churchDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const { data, totalCount } =
      await this.educationDomainService.findEducations(church, dto, qr);

    return new EducationPaginationResultDto(
      data,
      totalCount,
      data.length,
      dto.page,
      Math.ceil(totalCount / dto.take),
    );
  }

  async getEducationById(
    churchId: number,
    educationId: number,
    qr?: QueryRunner,
  ) {
    const church = await this.churchDomainService.findChurchModelById(
      churchId,
      qr,
    );

    return this.educationDomainService.findEducationById(
      church,
      educationId,
      qr,
    );
  }

  async createEducation(
    userId: number,
    churchId: number,
    dto: CreateEducationDto,
    qr?: QueryRunner,
  ) {
    const church = await this.churchDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const creatorMember = (
      await this.managerDomainService.findManagerByUserId(church, userId, qr)
    ).member;
    /*await this.membersDomainService.findMemberModelByUserId(
        church,
        userId,
        qr,
      );*/

    return this.educationDomainService.createEducation(
      church,
      creatorMember,
      dto,
      qr,
    );
  }

  async updateEducation(
    churchId: number,
    educationId: number,
    dto: UpdateEducationDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const education = await this.educationDomainService.findEducationModelById(
      church,
      educationId,
      qr,
    );

    // 이름 변경 시 하위 기수들의 교육명 업데이트
    if (dto.name) {
      await this.educationTermDomainService.updateEducationTermName(
        education,
        dto.name,
        qr,
      );
    }

    return this.educationDomainService.updateEducation(
      church,
      education,
      dto,
      qr,
    );
  }

  async deleteEducation(
    churchId: number,
    educationId: number,
    qr?: QueryRunner,
  ) {
    const church = await this.churchDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const targetEducation =
      await this.educationDomainService.findEducationModelById(
        church,
        educationId,
        qr,
      );

    await this.educationDomainService.deleteEducation(targetEducation, qr);

    return new EducationDeleteResponseDto(
      new Date(),
      targetEducation.id,
      targetEducation.name,
      true,
    );
  }
}
