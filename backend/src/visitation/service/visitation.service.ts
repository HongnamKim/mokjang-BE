import { Inject, Injectable } from '@nestjs/common';
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
import { UpdateVisitationMetaDto } from '../dto/internal/meta/update-visitation-meta.dto';
import { QueryRunner } from 'typeorm';
import { VisitationMetaModel } from '../entity/visitation-meta.entity';
import { CreateVisitationDto } from '../dto/request/create-visitation.dto';
import { CreateVisitationMetaDto } from '../dto/internal/meta/create-visitation-meta.dto';
import { GetVisitationDto } from '../dto/request/get-visitation.dto';
import { VisitationType } from '../const/visitation-type.enum';
import { UpdateVisitationDto } from '../dto/request/update-visitation.dto';
import {
  ChurchModel,
  ManagementCountType,
} from '../../churches/entity/church.entity';
import { MemberModel } from '../../members/entity/member.entity';
import {
  IVISITATION_REPORT_DOMAIN_SERVICE,
  IVisitationReportDomainService,
} from '../../report/visitation-report/visitation-report-domain/interface/visitation-report-domain.service.interface';
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
import { fromZonedTime } from 'date-fns-tz';
import { TIME_ZONE } from '../../common/const/time-zone.const';
import { VisitationNotificationService } from './visitation-notification.service';
import { NotificationSourceVisitation } from '../../notification/notification-event.dto';
import { NotificationDomain } from '../../notification/const/notification-domain.enum';

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

    private readonly visitationNotificationService: VisitationNotificationService,
    private readonly visitationDetailService: VisitationDetailService,
  ) {}

  async getVisitations(churchId: number, dto: GetVisitationDto) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const visitations =
      await this.visitationMetaDomainService.paginateVisitations(church, dto);

    return new VisitationPaginationResultDto(visitations);
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
    creatorManager: ChurchUserModel,
    churchId: number,
    dto: CreateVisitationDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const inCharge = await this.managerDomainService.findManagerByMemberId(
      church,
      dto.inChargeId,
      qr,
    );

    const memberIds = dto.memberIds;

    const members = await this.membersDomainService.findMembersById(
      church,
      memberIds,
      qr,
    );

    const startDate = fromZonedTime(dto.startDate, TIME_ZONE.SEOUL);
    const endDate = fromZonedTime(dto.endDate, TIME_ZONE.SEOUL);

    const visitationMeta = await this.createVisitationMeta(
      church,
      creatorManager,
      inCharge,
      members,
      startDate,
      endDate,
      dto,
      qr,
    );

    this.visitationNotificationService.notifyPost(
      visitationMeta,
      creatorManager,
      inCharge,
    );

    await this.visitationDetailService.createVisitationDetails(
      visitationMeta,
      members,
      dto,
      qr,
    );

    if (dto.receiverIds && dto.receiverIds.length > 0) {
      await this.handleAddVisitationReport(
        church,
        visitationMeta,
        creatorManager,
        dto.receiverIds,
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
   * @param startDate 심방 시작 시간
   * @param endDate 심방 종료 시간
   * @param dto 심방 생성 DTO
   * @param qr 트랜잭션을 위한 QueryRunner
   * @private
   */
  private async createVisitationMeta(
    church: ChurchModel,
    creator: ChurchUserModel,
    inCharge: ChurchUserModel,
    members: MemberModel[],
    startDate: Date,
    endDate: Date,
    dto: CreateVisitationDto,
    qr: QueryRunner,
  ) {
    const createVisitationMetaDto: CreateVisitationMetaDto = {
      creator,
      inCharge: inCharge,
      status: dto.status,
      visitationMethod: dto.visitationMethod,
      title: dto.title,
      startDate, //: dto.startDate,
      endDate, //: dto.endDate,
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
    church: ChurchModel,
    requestManager: ChurchUserModel,
    visitationMetaDataId: number,
    dto: UpdateVisitationDto,
    qr: QueryRunner,
  ) {
    const targetMetaData =
      await this.visitationMetaDomainService.findVisitationMetaModelById(
        church,
        visitationMetaDataId,
        qr,
        { members: true, reports: true },
      );

    // 심방 진행자 변경 시
    const newInstructor =
      dto.inChargeId && dto.inChargeId !== targetMetaData.inChargeId
        ? await this.managerDomainService.findManagerByMemberId(
            church,
            dto.inChargeId,
            qr,
          )
        : undefined;
    const oldInCharge = targetMetaData.inChargeId
      ? await this.managerDomainService.findManagerForNotification(
          church,
          targetMetaData.inChargeId,
          qr,
        )
      : null;

    const notificationSource = new NotificationSourceVisitation(
      NotificationDomain.VISITATION,
      targetMetaData.id,
    );

    const reportReceivers =
      await this.managerDomainService.findManagersForNotification(
        church,
        targetMetaData.reports.map((r) => r.receiverId),
        qr,
      );

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
      /*await this.visitationDetailService.handleUpdateVisitationMembers(
        church,
        targetMetaData,
        dto.memberIds,
        qr,
      );*/

      // 심방 메타 데이터의 대상자 수정
      await this.visitationMetaDomainService.updateVisitationMember(
        targetMetaData,
        newVisitationMembers,
        qr,
      );
    }

    const updateVisitationMetaDto: UpdateVisitationMetaDto = {
      startDate: dto.startDate
        ? fromZonedTime(dto.startDate, TIME_ZONE.SEOUL)
        : undefined,
      endDate: dto.endDate
        ? fromZonedTime(dto.endDate, TIME_ZONE.SEOUL)
        : undefined,
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

    // 알림 수신 대상자 (보고대상자 + 담당자(optional))
    let notificationTargets: ChurchUserModel[];

    if (newInstructor) {
      notificationTargets = reportReceivers;
    } else {
      notificationTargets = oldInCharge
        ? [...reportReceivers, oldInCharge]
        : reportReceivers;
    }

    // 심방의 상태값 변경 시 알림
    if (dto.status && dto.status !== targetMetaData.status) {
      this.visitationNotificationService.notifyStatusUpdate(
        requestManager,
        notificationTargets,
        targetMetaData.title,
        notificationSource,
        targetMetaData.status,
        dto.status,
      );
    }

    // 심방 데이터 변경 시 알림
    this.visitationNotificationService.notifyDataUpdate(
      requestManager,
      notificationTargets,
      targetMetaData.title,
      notificationSource,
      targetMetaData,
      dto,
    );

    // 심방 대상자 변경 알림
    if (dto.memberIds && dto.memberIds.length > 0) {
      this.visitationNotificationService.notifyMemberUpdate(
        requestManager,
        notificationTargets,
        targetMetaData.title,
        notificationSource,
      );
    }

    if (newInstructor) {
      this.visitationNotificationService.notifyInChargeUpdate(
        requestManager,
        reportReceivers,
        oldInCharge,
        newInstructor,
        targetMetaData.title,
        notificationSource,
      );
    }

    const updatedVisitation =
      await this.visitationMetaDomainService.findVisitationMetaById(
        church,
        visitationMetaDataId,
        qr,
      );

    return new PatchVisitationResponseDto(updatedVisitation);
  }

  async deleteVisitation(
    church: ChurchModel,
    requestManager: ChurchUserModel,
    visitationMetaDataId: number,
    qr: QueryRunner,
  ) {
    const metaData =
      await this.visitationMetaDomainService.findVisitationMetaModelById(
        church,
        visitationMetaDataId,
        qr,
        { reports: true },
      );

    // 메타 데이터 삭제
    await this.visitationMetaDomainService.deleteVisitationMeta(metaData, qr);

    // 심방 디테일 삭제
    await this.visitationDetailDomainService.deleteVisitationDetailsCascade(
      metaData,
      qr,
    );

    // 심방 보고 삭제
    await this.visitationReportDomainService.deleteVisitationReportCascade(
      metaData,
      qr,
    );

    const reportReceivers =
      await this.managerDomainService.findManagersForNotification(
        church,
        metaData.reports.map((r) => r.receiverId),
        qr,
      );

    const inCharge = metaData.inChargeId
      ? await this.managerDomainService.findManagerForNotification(
          church,
          metaData.inChargeId,
          qr,
        )
      : null;

    const notificationTargets = inCharge
      ? [...reportReceivers, inCharge]
      : reportReceivers;

    this.visitationNotificationService.notifyDelete(
      metaData.title,
      requestManager,
      notificationTargets,
    );

    return new DeleteVisitationResponseDto(
      new Date(),
      metaData.id,
      metaData.title,
      true,
    );
  }

  private async handleAddVisitationReport(
    church: ChurchModel,
    visitation: VisitationMetaModel,
    requestManager: ChurchUserModel,
    newReceiverIds: number[],
    qr: QueryRunner,
  ) {
    const newReceivers =
      await this.managerDomainService.findManagersByMemberIds(
        church,
        newReceiverIds,
        qr,
      );

    await this.visitationReportDomainService.createVisitationReports(
      visitation,
      newReceivers,
      qr,
    );

    this.visitationNotificationService.notifyReportAdded(
      visitation,
      requestManager,
      newReceivers,
    );

    return {
      visitationMetaId: visitation.id,
      addReceivers: newReceivers.map((newReceiver) => ({
        id: newReceiver.id,
        name: newReceiver.member.name,
      })),
      addedCount: newReceivers.length,
    };
  }

  async addReportReceivers(
    church: ChurchModel,
    requestManager: ChurchUserModel,
    visitationId: number,
    newReceiverIds: number[],
    qr: QueryRunner,
  ) {
    const visitation =
      await this.visitationMetaDomainService.findVisitationMetaModelById(
        church,
        visitationId,
        qr,
      );

    return this.handleAddVisitationReport(
      church,
      visitation,
      requestManager,
      newReceiverIds,
      qr,
    );
  }

  async deleteReportReceivers(
    church: ChurchModel,
    requestManager: ChurchUserModel,
    visitationId: number,
    deleteReceiverIds: number[],
    qr: QueryRunner,
  ) {
    const visitation =
      await this.visitationMetaDomainService.findVisitationMetaModelById(
        church,
        visitationId,
        qr,
        { inCharge: true, reports: { receiver: true } },
      );

    const result =
      await this.visitationReportDomainService.deleteVisitationReports(
        visitation,
        deleteReceiverIds,
        qr,
      );

    const removedReceivers =
      await this.managerDomainService.findManagersForNotification(
        church,
        deleteReceiverIds,
        qr,
      );

    this.visitationNotificationService.notifyReportRemoved(
      visitation,
      requestManager,
      removedReceivers,
    );

    return {
      visitationMetaId: visitation.id,
      deleteReceiverIds: deleteReceiverIds,
      deletedCount: result.affected,
    };
  }

  async refreshVisitationCount(church: ChurchModel, qr: QueryRunner) {
    const visitationCount =
      await this.visitationMetaDomainService.countAllVisitations(church, qr);

    await this.churchesDomainService.refreshManagementCount(
      church,
      ManagementCountType.VISITATION,
      visitationCount,
      qr,
    );

    return { visitationCount };
  }
}
