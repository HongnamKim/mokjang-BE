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
import { DeleteResponseDto } from '../../../common/dto/reponse/delete-response.dto';

@Injectable()
export class EducationsService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchDomainService: IChurchesDomainService,
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
    churchId: number,
    dto: CreateEducationDto,
    qr?: QueryRunner,
  ) {
    const church = await this.churchDomainService.findChurchModelById(
      churchId,
      qr,
    );

    return this.educationDomainService.createEducation(church, dto, qr);
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

    return new DeleteResponseDto(
      new Date(),
      targetEducation.id,
      targetEducation.name,
      true,
    );
  }
}
