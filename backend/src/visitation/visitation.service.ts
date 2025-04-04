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
import {
  IUSER_DOMAIN_SERVICE,
  IUserDomainService,
} from '../user/user-domain/interface/user-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../members/member-domain/service/interface/members-domain.service.interface';
import { UserRole } from '../user/const/user-role.enum';
import { UpdateVisitationMetaDto } from './dto/meta/update-visitation-meta.dto';
import { QueryRunner } from 'typeorm';
import { VisitationDetailModel } from './entity/visitation-detail.entity';
import { VisitationMetaModel } from './entity/visitation-meta.entity';
import { CreateVisitationDto } from './dto/create-visitation.dto';
import { JwtAccessPayload } from '../auth/type/jwt';
import { VisitationMetaException } from './const/exception/visitation-meta.exception';
import { CreateVisitationMetaDto } from './dto/meta/create-visitation-meta.dto';

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

  async createVisitation(
    accessPayload: JwtAccessPayload,
    churchId: number,
    dto: CreateVisitationDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    /*const creatorUser = await this.userDomainService.findUserById(
      accessPayload.id,
      qr,
    );

    const creatorMember = await this.membersDomainService.findMemberModelById(
      church,
      creatorUser.memberId,
      qr,
    );*/

    const instructor = await this.membersDomainService.findMemberModelById(
      church,
      dto.instructorId,
      qr,
      { user: true },
    );

    // 심방 진행자 검증
    if (
      !instructor.user.role ||
      (instructor.user.role !== UserRole.mainAdmin &&
        instructor.user.role !== UserRole.manager)
    ) {
      throw new BadRequestException(VisitationMetaException.INVALID_INSTRUCTOR);
    }

    const createVisitationMetaDto: CreateVisitationMetaDto = {
      instructorId: dto.instructorId,
      visitationStatus: dto.visitationStatus,
      visitationMethod: dto.visitationMethod,
      visitationType: dto.visitationType,
      visitationTitle: dto.visitationTitle,
      visitationDate: dto.visitationDate,
    };

    const metaData =
      await this.visitationMetaDomainService.createVisitationMetaData(
        church,
        instructor,
        createVisitationMetaDto,
        qr,
      );

    const detailData = await Promise.all(
      dto.visitationDetails.map(async (visitationDetailDto) => {
        const member = await this.membersDomainService.findMemberModelById(
          church,
          visitationDetailDto.memberId,
          qr,
          {
            group: true,
            groupRole: true,
            officer: true,
          },
        );

        return this.visitationDetailDomainService.createVisitationDetail(
          metaData,
          member,
          visitationDetailDto,
          qr,
        );
      }),
    );

    const { user, ...instructorMember } = instructor;

    const reservedVisitation = {
      ...metaData,
      instructor: instructorMember,
      visitationDetails: detailData,
    };

    return reservedVisitation;
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
