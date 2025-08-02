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
  IEDUCATION_TERM_DOMAIN_SERVICE,
  IEducationTermDomainService,
} from './education-domain/interface/education-term-domain.service.interface';
import { EducationPaginationResultDto } from '../dto/education-pagination-result.dto';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMANAGER_DOMAIN_SERVICE,
  IManagerDomainService,
} from '../../manager/manager-domain/service/interface/manager-domain.service.interface';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import {
  ChurchModel,
  ManagementCountType,
} from '../../churches/entity/church.entity';
import { PostEducationResponseDto } from '../dto/education/response/post-education-response.dto';
import { PatchEducationResponseDto } from '../dto/education/response/patch-education-response.dto';
import { DeleteEducationResponseDto } from '../dto/education/response/delete-education-response.dto';

@Injectable()
export class EducationsService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchDomainService: IChurchesDomainService,
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

    const data = await this.educationDomainService.findEducations(
      church,
      dto,
      qr,
    );

    return new EducationPaginationResultDto(data);
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

  private createDescriptionSummary(description: string) {
    if (description.length > 30) {
      return `${description.slice(0, 30).trim()}...`;
    } else {
      return description;
    }
  }

  async createEducation(
    creatorManager: ChurchUserModel,
    churchId: number,
    dto: CreateEducationDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchDomainService.findChurchModelById(
      churchId,
      qr,
    );

    await this.churchDomainService.incrementManagementCount(
      church,
      ManagementCountType.EDUCATION,
      qr,
    );

    dto.descriptionSummary = dto.description
      ? this.createDescriptionSummary(dto.description)
      : undefined;

    const newEducation = await this.educationDomainService.createEducation(
      church,
      creatorManager,
      dto,
      qr,
    );

    return new PostEducationResponseDto(newEducation);
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

    const targetEducation =
      await this.educationDomainService.findEducationModelById(
        church,
        educationId,
        qr,
      );

    // 이름 변경 시 하위 기수들의 교육명 업데이트
    if (dto.name) {
      await this.educationTermDomainService.updateEducationTermName(
        targetEducation,
        dto.name,
        qr,
      );
    }

    dto.descriptionSummary = dto.description
      ? this.createDescriptionSummary(dto.description)
      : undefined;

    await this.educationDomainService.updateEducation(
      church,
      targetEducation,
      dto,
      qr,
    );

    if (dto.name) {
      targetEducation.name = dto.name;
    }

    if (dto.description) {
      targetEducation.description = dto.description;
    }
    if (dto.descriptionSummary) {
      targetEducation.descriptionSummary = dto.descriptionSummary;
    }

    if (dto.goals) {
      targetEducation.goals = dto.goals;
    }

    return new PatchEducationResponseDto(targetEducation);
  }

  async deleteEducation(
    churchId: number,
    educationId: number,
    qr: QueryRunner,
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
    await this.churchDomainService.decrementManagementCount(
      church,
      ManagementCountType.EDUCATION,
      qr,
    );

    return new DeleteEducationResponseDto(
      new Date(),
      targetEducation.id,
      targetEducation.name,
      true,
    );
  }

  async refreshEducationCount(church: ChurchModel, qr: QueryRunner) {
    const educationCount = await this.educationDomainService.countAllEducations(
      church,
      qr,
    );

    await this.churchDomainService.refreshManagementCount(
      church,
      ManagementCountType.EDUCATION,
      educationCount,
      qr,
    );

    return { educationCount };
  }
}
