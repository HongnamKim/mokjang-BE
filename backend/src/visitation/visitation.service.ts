import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  IVISITATION_META_DOMAIN_SERVICE,
  IVisitationMetaDomainService,
} from './visitation-domain/service/interface/visitation-meta-domain.service.interface';
import {
  IVISITATION_DETAIL_DOMAIN_SERVICE,
  IVisitationDetailDomainService,
} from './visitation-domain/service/interface/visitation-detail-domain.service.interface';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../churches/churches-domain/interface/churches-domain.service.interface';
import { CreateVisitationMetaDto } from './dto/meta/create-visitation-meta.dto';
import {
  IUSER_DOMAIN_SERVICE,
  IUserDomainService,
} from '../user/user-domain/interface/user-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../members/member-domain/service/interface/members-domain.service.interface';
import { UserRole } from '../user/const/user-role.enum';
import { VisitationMetaException } from './const/exception/visitation-meta.exception';
import { UpdateVisitationMetaDto } from './dto/meta/update-visitation-meta.dto';
import { QueryRunner } from 'typeorm';
import { VisitationDetailModel } from './entity/visitation-detail.entity';
import { VisitationMetaModel } from './entity/visitation-meta.entity';

@Injectable()
export class VisitationService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IUSER_DOMAIN_SERVICE)
    private readonly userDomainService: IUserDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,

    @Inject(IVISITATION_META_DOMAIN_SERVICE)
    private readonly visitationMetaDomainService: IVisitationMetaDomainService,
    @Inject(IVISITATION_DETAIL_DOMAIN_SERVICE)
    private readonly visitationDetailDomainService: IVisitationDetailDomainService,
  ) {}

  async getVisitations(churchId: number) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const { visitations, totalCount } =
      await this.visitationMetaDomainService.paginateVisitations(church);

    return {
      data: visitations,
      totalCount,
    };
  }

  async getVisitationById(
    churchId: number,
    visitingMetaDataId: number,
    qr: QueryRunner,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const visitationMeta =
      await this.visitationMetaDomainService.findVisitationMetaById(
        church,
        visitingMetaDataId,
        qr,
      );

    const visitationDetails: VisitationDetailModel[] = [];

    const visitation: VisitationMetaModel = {
      ...visitationMeta,
      visitationDetails,
    };

    return visitation;
  }

  async createVisitingMetaData(churchId: number, dto: CreateVisitationMetaDto) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const instructor = await this.membersDomainService.findMemberModelById(
      church,
      dto.instructorId,
      undefined,
      { user: true },
    );

    if (
      !instructor.user ||
      (instructor.user.role !== UserRole.mainAdmin &&
        instructor.user.role !== UserRole.manager)
    ) {
      throw new BadRequestException(VisitationMetaException.INVALID_INSTRUCTOR);
    }

    return this.visitationMetaDomainService.createVisitationMetaData(
      church,
      instructor,
      dto,
    );
  }

  async updateVisitingMetaData(
    churchId: number,
    visitationMetaDataId: number,
    dto: UpdateVisitationMetaDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const targetMetaData =
      await this.visitationMetaDomainService.findVisitationMetaModelById(
        church,
        visitationMetaDataId,
      );

    return this.visitationMetaDomainService.updateVisitationMetaData(
      targetMetaData,
      dto,
    );
  }
}
