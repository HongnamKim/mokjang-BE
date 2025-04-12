import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../members/member-domain/service/interface/members-domain.service.interface';
import { UserRole } from '../user/const/user-role.enum';
import { UpdateVisitationMetaDto } from './dto/internal/meta/update-visitation-meta.dto';
import { QueryRunner } from 'typeorm';
import { VisitationDetailModel } from './entity/visitation-detail.entity';
import { VisitationMetaModel } from './entity/visitation-meta.entity';
import { CreateVisitationDto } from './dto/create-visitation.dto';
import { JwtAccessPayload } from '../auth/type/jwt';
import { VisitationException } from './const/exception/visitation.exception';
import { CreateVisitationMetaDto } from './dto/internal/meta/create-visitation-meta.dto';
import { GetVisitationDto } from './dto/get-visitation.dto';
import { VisitationType } from './const/visitation-type.enum';
import { UpdateVisitationDetailDto } from './dto/internal/detail/update-visitation-detail.dto';
import { UpdateVisitationDto } from './dto/update-visitation.dto';
import { ChurchModel } from '../churches/entity/church.entity';
import { MemberModel } from '../members/entity/member.entity';
import { VisitationDetailDto } from './dto/visittion-detail.dto';
import { MemberException } from '../members/const/exception/member.exception';
import {
  IVISITATION_REPORT_DOMAIN_SERVICE,
  IVisitationReportDomainService,
} from '../report/report-domain/service/visitation-report-domain.service.interface';

@Injectable()
export class VisitationService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,

    @Inject(IVISITATION_META_DOMAIN_SERVICE)
    private readonly visitationMetaDomainService: IVisitationMetaDomainService,
    @Inject(IVISITATION_DETAIL_DOMAIN_SERVICE)
    private readonly visitationDetailDomainService: IVisitationDetailDomainService,

    @Inject(IVISITATION_REPORT_DOMAIN_SERVICE)
    private readonly visitationReportDomainService: IVisitationReportDomainService,
  ) {}

  async getVisitations(churchId: number, dto: GetVisitationDto) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const { visitations, totalCount } =
      await this.visitationMetaDomainService.paginateVisitations(church, dto);

    return {
      data: visitations,
      take: dto.take,
      page: dto.page,
      totalPage: Math.ceil(totalCount / dto.take),
      totalCount,
      count: visitations.length,
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

    const visitationDetails: VisitationDetailModel[] =
      await this.visitationDetailDomainService.findVisitationDetailsByMetaId(
        visitationMeta,
        qr,
      );

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

    const creatorMember =
      await this.membersDomainService.findMemberModelByUserId(
        church,
        accessPayload.id,
        qr,
      );

    const instructor = await this.membersDomainService.findMemberModelById(
      church,
      dto.instructorId,
      qr,
      { user: true },
    );

    /**
     * TODO
     * reportTo: 보고자 추가
     * 알림 관련 도메인 설계 필요
     */

    // 심방 진행자 검증
    !dto.isTest && this.checkInstructorAuthorization(instructor);

    const memberIds = dto.visitationDetails.map((detail) => detail.memberId);

    const members = await this.membersDomainService.findMembersById(
      church,
      memberIds,
      qr,
    );

    const visitationMeta = await this.createVisitationMeta(
      church,
      creatorMember,
      instructor,
      members,
      dto,
      qr,
    );

    await this.createVisitationDetails(visitationMeta, members, dto, qr);

    return this.getVisitationById(churchId, visitationMeta.id, qr);
  }

  /**
   * 심방 생성 시 대상자들의 심방 세부 데이터 생성
   * @param visitationMeta 사전에 생성된 심방 메타 데이터
   * @param members 심방 대상자 교인 엔티티 배열
   * @param dto 심방 생성 DTO
   * @param qr 트랜잭션을 위한 QueryRunner
   * @private
   */
  private async createVisitationDetails(
    visitationMeta: VisitationMetaModel,
    members: MemberModel[],
    dto: CreateVisitationDto,
    qr: QueryRunner,
  ) {
    return Promise.all(
      dto.visitationDetails.map(async (visitationDetailDto) => {
        const visitationMember = members.find(
          (member) => member.id === visitationDetailDto.memberId,
        );

        if (!visitationMember) {
          throw new NotFoundException(MemberException.NOT_FOUND);
        }

        return this.visitationDetailDomainService.createVisitationDetail(
          visitationMeta,
          visitationMember,
          visitationDetailDto,
          qr,
        );
      }),
    );
  }

  /**
   * 심방 생성 시 심방의 메타 데이터 생성
   * @param church 교회 엔티티
   * @param creator 심방 생성 교인
   * @param instructor 심방 진행자
   * @param members 심방 대상자 (교인 엔티티 배열)
   * @param dto 심방 생성 DTO
   * @param qr 트랜잭션을 위한 QueryRunner
   * @private
   */
  private async createVisitationMeta(
    church: ChurchModel,
    creator: MemberModel,
    instructor: MemberModel,
    members: MemberModel[],
    dto: CreateVisitationDto,
    qr: QueryRunner,
  ) {
    const createVisitationMetaDto: CreateVisitationMetaDto = {
      creator,
      instructor,
      visitationStatus: dto.visitationStatus,
      visitationMethod: dto.visitationMethod,
      visitationTitle: dto.visitationTitle,
      visitationDate: dto.visitationDate,
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

  private checkInstructorAuthorization(instructor: MemberModel) {
    if (
      !instructor.user ||
      (instructor.user.role !== UserRole.mainAdmin &&
        instructor.user.role !== UserRole.manager)
    ) {
      throw new ForbiddenException(VisitationException.INVALID_INSTRUCTOR);
    }
  }

  private async updateVisitationMembers(
    church: ChurchModel,
    visitationMeta: VisitationMetaModel,
    dto: UpdateVisitationDto,
    qr: QueryRunner,
  ) {
    if (!visitationMeta.members) {
      throw new InternalServerErrorException('심방 대상자 불러오기 실패');
    }

    let visitationMembers = [...visitationMeta.members];

    // 교인이 추가되는 경우 추가할 수 있는지 확인
    if (dto.addMemberIds) {
      const visitationMemberIds = visitationMeta.members.map(
        (member) => member.id,
      );

      const alreadyExistMember: number[] = [];

      dto.addMemberIds.forEach((memberId) => {
        if (visitationMemberIds.includes(memberId)) {
          alreadyExistMember.push(memberId);
        }
      });

      if (alreadyExistMember.length > 0) {
        throw new ConflictException(
          VisitationException.ALREADY_EXIST_TARGET_MEMBER(alreadyExistMember),
        );
      }

      const newMembers = await this.membersDomainService.findMembersById(
        church,
        dto.addMemberIds,
        qr,
      );

      // 새 심방 대상자 추가
      visitationMembers.push(...newMembers);

      await Promise.all(
        dto.addMemberIds.map(async (memberId) => {
          const member = await this.membersDomainService.findMemberModelById(
            church,
            memberId,
            qr,
          );

          const detailDto: VisitationDetailDto = {
            memberId: memberId,
          };

          return this.visitationDetailDomainService.createVisitationDetail(
            visitationMeta,
            member,
            detailDto,
            qr,
          );
        }),
      );
    }

    // 교인이 삭제되는 경우 삭제할 수 있는지 확인
    if (dto.deleteMemberIds) {
      const visitationMemberIds = visitationMeta.members.map(
        (member) => member.id,
      );

      const notExistMember: number[] = [];

      // 심방 대상자에 존재하지 않는 id 값 필터링
      dto.deleteMemberIds.forEach((memberId) => {
        if (!visitationMemberIds.includes(memberId)) {
          notExistMember.push(memberId);
        }
      });

      if (notExistMember.length > 0) {
        throw new ConflictException(
          VisitationException.NOT_EXIST_DELETE_TARGET_MEMBER(notExistMember),
        );
      }

      visitationMembers = visitationMembers.filter(
        (member) => !dto.deleteMemberIds?.includes(member.id),
      );

      await Promise.all(
        dto.deleteMemberIds.map(async (memberId) => {
          const member = await this.membersDomainService.findMemberModelById(
            church,
            memberId,
            qr,
          );

          const deleteTarget =
            await this.visitationDetailDomainService.findVisitationDetailByMetaAndMemberId(
              visitationMeta,
              member,
              qr,
            );

          await this.visitationDetailDomainService.deleteVisitationDetail(
            deleteTarget,
            qr,
          );
        }),
      );
    }

    await this.visitationMetaDomainService.updateVisitationMember(
      visitationMeta,
      visitationMembers,
      qr,
    );

    return visitationMembers;
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
      dto.instructorId && dto.instructorId !== targetMetaData.instructorId
        ? await this.membersDomainService.findMemberModelById(
            church,
            dto.instructorId,
            qr,
            { user: true },
          )
        : undefined;

    // 새로운 심방 진행자의 권한 확인
    if (newInstructor && !dto.isTest) {
      this.checkInstructorAuthorization(newInstructor);
    }

    // 심방 대상자 변경
    let visitationType: VisitationType = targetMetaData.visitationType;

    if (dto.addMemberIds || dto.deleteMemberIds) {
      const newVisitationMembers = await this.updateVisitationMembers(
        church,
        targetMetaData,
        dto,
        qr,
      );

      visitationType =
        newVisitationMembers.length > 1
          ? VisitationType.GROUP
          : VisitationType.SINGLE;
    }

    const updateVisitationMetaDto: UpdateVisitationMetaDto = {
      visitationDate: dto.visitationDate,
      visitationMethod: dto.visitationMethod,
      visitationType,
      visitationStatus: dto.visitationStatus,
      visitationTitle: dto.visitationTitle,
      instructor: newInstructor,
    };

    await this.visitationMetaDomainService.updateVisitationMetaData(
      targetMetaData,
      updateVisitationMetaDto,
      qr,
    );

    return this.visitationMetaDomainService.findVisitationMetaById(
      church,
      visitationMetaDataId,
      qr,
    );
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

    await this.visitationMetaDomainService.deleteVisitationMeta(metaData, qr);

    await this.visitationDetailDomainService.deleteVisitationDetailsCascade(
      metaData,
      qr,
    );
  }

  async updateVisitationDetail(
    churchId: number,
    visitationId: number,
    detailId: number,
    dto: UpdateVisitationDetailDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const metaData =
      await this.visitationMetaDomainService.findVisitationMetaModelById(
        church,
        visitationId,
      );

    const detailData =
      await this.visitationDetailDomainService.findVisitationDetailModelById(
        metaData,
        detailId,
      );

    return this.visitationDetailDomainService.updateVisitationDetail(
      metaData,
      detailData,
      dto,
    );
  }
}
