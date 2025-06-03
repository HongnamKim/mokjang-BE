import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  IVISITATION_META_DOMAIN_SERVICE,
  IVisitationMetaDomainService,
} from '../visitation-domain/interface/visitation-meta-domain.service.interface';
import {
  IVISITATION_DETAIL_DOMAIN_SERVICE,
  IVisitationDetailDomainService,
} from '../visitation-domain/interface/visitation-detail-domain.service.interface';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../members/member-domain/interface/members-domain.service.interface';
import { UserRole } from '../../user/const/user-role.enum';
import { UpdateVisitationMetaDto } from '../dto/internal/meta/update-visitation-meta.dto';
import { QueryRunner } from 'typeorm';
import { VisitationMetaModel } from '../entity/visitation-meta.entity';
import { CreateVisitationDto } from '../dto/request/create-visitation.dto';
import { JwtAccessPayload } from '../../auth/type/jwt';
import { VisitationException } from '../const/exception/visitation.exception';
import { CreateVisitationMetaDto } from '../dto/internal/meta/create-visitation-meta.dto';
import { GetVisitationDto } from '../dto/request/get-visitation.dto';
import { VisitationType } from '../const/visitation-type.enum';
import { UpdateVisitationDto } from '../dto/request/update-visitation.dto';
import { ChurchModel } from '../../churches/entity/church.entity';
import { MemberModel } from '../../members/entity/member.entity';
import {
  IVISITATION_REPORT_DOMAIN_SERVICE,
  IVisitationReportDomainService,
} from '../../report/report-domain/interface/visitation-report-domain.service.interface';
import { AddConflictException } from '../../common/exception/add-conflict.exception';
import { RemoveConflictException } from '../../common/exception/remove-conflict.exception';
import { VisitationPaginationResultDto } from '../dto/response/visitation-pagination-result.dto';
import { VisitationDetailService } from './visitation-detail.service';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import {
  IMANAGER_DOMAIN_SERVICE,
  IManagerDomainService,
} from '../../manager/manager-domain/service/interface/manager-domain.service.interface';
import { GetVisitationResponseDto } from '../dto/response/get-visitation-response.dto';
import { PostVisitationResponseDto } from '../dto/response/post-visitation-response.dto';
import { PatchVisitationResponseDto } from '../dto/response/patch-visitation-response.dto';
import { DeleteVisitationResponseDto } from '../dto/response/delete-visitation-response.dto';

@Injectable()
export class VisitationService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,
    @Inject(IMANAGER_DOMAIN_SERVICE)
    private readonly managerDomainService: IManagerDomainService,

    @Inject(IVISITATION_META_DOMAIN_SERVICE)
    private readonly visitationMetaDomainService: IVisitationMetaDomainService,
    @Inject(IVISITATION_DETAIL_DOMAIN_SERVICE)
    private readonly visitationDetailDomainService: IVisitationDetailDomainService,

    @Inject(IVISITATION_REPORT_DOMAIN_SERVICE)
    private readonly visitationReportDomainService: IVisitationReportDomainService,

    private readonly visitationDetailService: VisitationDetailService,
  ) {}

  async getVisitations(churchId: number, dto: GetVisitationDto) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const { visitations, totalCount } =
      await this.visitationMetaDomainService.paginateVisitations(church, dto);

    return new VisitationPaginationResultDto(
      visitations,
      totalCount,
      visitations.length,
      dto.page,
      Math.ceil(totalCount / dto.take),
    );
  }

  async getVisitationById(
    churchId: number,
    visitingMetaDataId: number,
    qr: QueryRunner,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const visitation =
      await this.visitationMetaDomainService.findVisitationMetaById(
        church,
        visitingMetaDataId,
        qr,
      );

    return new GetVisitationResponseDto(visitation);
  }

  async createVisitation(
    creatorId: number,
    churchId: number,
    dto: CreateVisitationDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const creator = await this.managerDomainService.findManagerByUserId(
      church,
      creatorId,
      qr,
    );

    const inCharge = await this.managerDomainService.findManagerById(
      church,
      dto.inChargeId,
      qr,
    );

    const memberIds = dto.visitationDetails.map((detail) => detail.memberId);

    const members = await this.membersDomainService.findMembersById(
      church,
      memberIds,
      qr,
    );

    const visitationMeta = await this.createVisitationMeta(
      church,
      creator,
      inCharge,
      members,
      dto,
      qr,
    );

    await this.visitationDetailService.createVisitationDetails(
      visitationMeta,
      members,
      dto,
      qr,
    );

    if (dto.receiverIds && dto.receiverIds.length > 0) {
      await this.createVisitationReports(
        church,
        dto.receiverIds,
        visitationMeta,
        qr,
      );
    }

    const newVisitation =
      await this.visitationMetaDomainService.findVisitationMetaById(
        church,
        visitationMeta.id,
        qr,
      );

    return new PostVisitationResponseDto(newVisitation);
  }

  /**
   * 심방 생성 시 심방의 메타 데이터 생성
   * @param church 교회 엔티티
   * @param creator 심방 생성 교인
   * @param inCharge 심방 진행자
   * @param members 심방 대상자 (교인 엔티티 배열)
   * @param dto 심방 생성 DTO
   * @param qr 트랜잭션을 위한 QueryRunner
   * @private
   */
  private async createVisitationMeta(
    church: ChurchModel,
    creator: ChurchUserModel,
    inCharge: ChurchUserModel,
    members: MemberModel[],
    dto: CreateVisitationDto,
    qr: QueryRunner,
  ) {
    const createVisitationMetaDto: CreateVisitationMetaDto = {
      creator,
      inCharge: inCharge,
      status: dto.status,
      visitationMethod: dto.visitationMethod,
      title: dto.title,
      startDate: dto.startDate,
      endDate: dto.endDate,
      visitationType:
        members.length > 1 ? VisitationType.GROUP : VisitationType.SINGLE,
    };

    return this.visitationMetaDomainService.createVisitationMetaData(
      church,
      createVisitationMetaDto,
      members,
      qr,
    );
  }

  async updateVisitationData(
    churchId: number,
    visitationMetaDataId: number,
    dto: UpdateVisitationDto,
    qr: QueryRunner,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const targetMetaData =
      await this.visitationMetaDomainService.findVisitationMetaModelById(
        church,
        visitationMetaDataId,
        qr,
        { members: true },
      );

    // 심방 진행자 변경 시
    const newInstructor =
      dto.inChargeId && dto.inChargeId !== targetMetaData.inChargeId
        ? await this.managerDomainService.findManagerById(
            church,
            dto.inChargeId,
            qr,
          )
        : undefined;

    // 심방 대상자 변경
    let visitationType: VisitationType = targetMetaData.visitationType;

    if (dto.memberIds) {
      const newVisitationMembers =
        await this.membersDomainService.findMembersById(
          church,
          dto.memberIds,
          qr,
        );

      visitationType =
        newVisitationMembers.length > 1
          ? VisitationType.GROUP
          : VisitationType.SINGLE;

      // 변경된 대상자에 맞게 심방 디테일 생성/삭제
      await this.visitationDetailService.handleUpdateVisitationMembers(
        church,
        targetMetaData,
        dto.memberIds,
        qr,
      );

      // 심방 메타 데이터의 대상자 수정
      await this.visitationMetaDomainService.updateVisitationMember(
        targetMetaData,
        newVisitationMembers,
        qr,
      );
    }

    const updateVisitationMetaDto: UpdateVisitationMetaDto = {
      startDate: dto.startDate,
      endDate: dto.endDate,
      visitationMethod: dto.visitationMethod,
      visitationType,
      status: dto.status,
      title: dto.title,
      inCharge: newInstructor,
    };

    await this.visitationMetaDomainService.updateVisitationMetaData(
      targetMetaData,
      updateVisitationMetaDto,
      qr,
    );

    const updatedVisitation =
      await this.visitationMetaDomainService.findVisitationMetaById(
        church,
        visitationMetaDataId,
        qr,
      );

    return new PatchVisitationResponseDto(updatedVisitation);
  }

  async deleteVisitation(
    churchId: number,
    visitationMetaDataId: number,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const metaData =
      await this.visitationMetaDomainService.findVisitationMetaModelById(
        church,
        visitationMetaDataId,
        qr,
      );

    // 메타 데이터 삭제
    await this.visitationMetaDomainService.deleteVisitationMeta(metaData, qr);

    // 심방 디테일 삭제
    await this.visitationDetailDomainService.deleteVisitationDetailsCascade(
      metaData,
      qr,
    );

    return new DeleteVisitationResponseDto(
      new Date(),
      metaData.id,
      metaData.title,
      true,
    );
  }

  private async createVisitationReports(
    church: ChurchModel,
    receiverIds: number[],
    visitationMeta: VisitationMetaModel,
    qr: QueryRunner,
  ) {
    const receivers = await this.membersDomainService.findMembersById(
      church,
      receiverIds,
      qr,
      { user: true },
    );

    return Promise.all(
      receivers.map(async (receiver) => {
        // 권한 검증
        if (
          receiver.user.role !== UserRole.MANAGER &&
          receiver.user.role !== UserRole.OWNER
        ) {
          throw new ForbiddenException(VisitationException.INVALID_RECEIVER);
        }

        return this.visitationReportDomainService.createVisitationReport(
          visitationMeta,
          //sender,
          receiver,
          qr,
        );
      }),
    );
  }

  async addReportReceivers(
    churchId: number,
    visitationId: number,
    newReceiverIds: number[],
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const visitation =
      await this.visitationMetaDomainService.findVisitationMetaModelById(
        church,
        visitationId,
        qr,
        { reports: true },
      );

    const reports = visitation.reports;
    const oldReceiverIds = new Set(reports.map((report) => report.receiverId));

    const duplicated = newReceiverIds.filter((id) => oldReceiverIds.has(id));

    if (duplicated.length > 0) {
      throw new AddConflictException(
        VisitationException.ALREADY_REPORTED_MEMBER,
        duplicated,
      );
    }

    const newReceivers = await this.membersDomainService.findMembersById(
      church,
      newReceiverIds,
      qr,
      { user: true },
    );

    const isAvailableReceivers = newReceivers.every((receiver) => {
      return (
        receiver.user &&
        (receiver.user.role === UserRole.OWNER ||
          receiver.user.role === UserRole.MANAGER)
      );
    });

    if (!isAvailableReceivers) {
      throw new BadRequestException(
        VisitationException.INVALID_REPORT_RECEIVER,
      );
    }

    await Promise.all(
      newReceivers.map((receiver) => {
        return this.visitationReportDomainService.createVisitationReport(
          visitation,
          receiver,
          qr,
        );
      }),
    );

    return {
      visitationId,
      addedReceivers: newReceivers.map((r) => ({
        id: r.id,
        name: r.name,
      })),
      addedCount: newReceivers.length,
    };
  }

  async deleteReportReceivers(
    churchId: number,
    visitationId: number,
    deleteReceiverIds: number[],
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const visitation =
      await this.visitationMetaDomainService.findVisitationMetaModelById(
        church,
        visitationId,
        qr,
        { inCharge: true, reports: { receiver: true } },
      );

    const reports = visitation.reports;
    const oldReceiverIds = new Set(reports.map((report) => report.receiverId));

    const notExistReceivers = deleteReceiverIds.filter(
      (id) => !oldReceiverIds.has(id),
    );

    if (notExistReceivers.length > 0) {
      throw new RemoveConflictException(
        VisitationException.NOT_EXIST_REPORTED_MEMBER,
        notExistReceivers,
      );
    }

    const deleteReports = reports.filter((report) =>
      deleteReceiverIds.includes(report.receiverId),
    );

    const result =
      await this.visitationReportDomainService.deleteVisitationReports(
        deleteReports,
        qr,
      );

    return {
      visitationId,
      deletedReceivers: deleteReports.map((r) => ({
        id: r.receiver.id,
        name: r.receiver.name,
      })),
      deletedCount: result.affected,
    };
  }
}
