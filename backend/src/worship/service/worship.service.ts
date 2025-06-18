import { Inject, Injectable } from '@nestjs/common';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IWORSHIP_DOMAIN_SERVICE,
  IWorshipDomainService,
} from '../worship-domain/interface/worship-domain.service.interface';
import { GetWorshipsDto } from '../dto/request/worship/get-worships.dto';
import { WorshipPaginationResponseDto } from '../dto/response/worship/worship-pagination-response.dto';
import { QueryRunner } from 'typeorm';
import { GetWorshipResponseDto } from '../dto/response/worship/get-worship-response.dto';
import { CreateWorshipDto } from '../dto/request/worship/create-worship.dto';
import {
  IWORSHIP_TARGET_GROUP_DOMAIN_SERVICE,
  IWorshipTargetGroupDomainService,
} from '../worship-domain/interface/worship-target-group-domain.service.interface';
import {
  IGROUPS_DOMAIN_SERVICE,
  IGroupsDomainService,
} from '../../management/groups/groups-domain/interface/groups-domain.service.interface';
import { PostWorshipResponseDto } from '../dto/response/worship/post-worship-response.dto';
import { DeleteWorshipResponseDto } from '../dto/response/worship/delete-worship-response.dto';
import { UpdateWorshipDto } from '../dto/request/worship/update-worship.dto';
import { PatchWorshipResponseDto } from '../dto/response/worship/patch-worship-response.dto';
import { WorshipModel } from '../entity/worship.entity';
import { ChurchModel } from '../../churches/entity/church.entity';
import {
  IWORSHIP_ENROLLMENT_DOMAIN_SERVICE,
  IWorshipEnrollmentDomainService,
} from '../worship-domain/interface/worship-enrollment-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../members/member-domain/interface/members-domain.service.interface';

@Injectable()
export class WorshipService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IWORSHIP_DOMAIN_SERVICE)
    private readonly worshipDomainService: IWorshipDomainService,
    @Inject(IWORSHIP_TARGET_GROUP_DOMAIN_SERVICE)
    private readonly worshipTargetGroupDomainService: IWorshipTargetGroupDomainService,
    @Inject(IGROUPS_DOMAIN_SERVICE)
    private readonly groupsDomainService: IGroupsDomainService,

    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,
    @Inject(IWORSHIP_ENROLLMENT_DOMAIN_SERVICE)
    private readonly worshipEnrollmentDomainService: IWorshipEnrollmentDomainService,
  ) {}

  async findWorships(churchId: number, dto: GetWorshipsDto) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const { data, totalCount } = await this.worshipDomainService.findWorships(
      church,
      dto,
    );

    return new WorshipPaginationResponseDto(
      data,
      totalCount,
      data.length,
      dto.page,
      Math.ceil(totalCount / dto.take),
    );
  }

  async findWorshipById(churchId: number, worshipId: number, qr?: QueryRunner) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const worship = await this.worshipDomainService.findWorshipById(
      church,
      worshipId,
      qr,
    );

    return new GetWorshipResponseDto(worship);
  }

  async postWorship(churchId: number, dto: CreateWorshipDto, qr: QueryRunner) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const newWorship = await this.worshipDomainService.createWorship(
      church,
      dto,
      qr,
    );

    const groups = await this.groupsDomainService.findGroupModelsByIds(
      church,
      dto.worshipTargetGroupIds,
      qr,
    );

    // TargetGroup 지정
    await this.worshipTargetGroupDomainService.createWorshipTargetGroup(
      newWorship,
      groups,
      qr,
    );

    const worship = await this.worshipDomainService.findWorshipById(
      church,
      newWorship.id,
      qr,
    );

    const allMembers = await this.membersDomainService.findAllMembers(
      church,
      qr,
    );

    await this.worshipEnrollmentDomainService.refreshEnrollments(
      newWorship,
      allMembers,
      qr,
    );

    return new PostWorshipResponseDto(worship);
  }

  async patchWorshipById(
    churchId: number,
    worshipId: number,
    dto: UpdateWorshipDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const targetWorship = await this.worshipDomainService.findWorshipModelById(
      church,
      worshipId,
      qr,
      { worshipTargetGroups: true },
    );

    // 예배 대상 그룹 업데이트
    if (dto.worshipTargetGroupIds && dto.worshipTargetGroupIds.length) {
      await this.handleTargetGroupChange(
        church,
        targetWorship,
        dto.worshipTargetGroupIds,
        qr,
      );
    }

    // 예배 정보 업데이트
    await this.worshipDomainService.updateWorship(
      church,
      targetWorship,
      dto,
      qr,
    );

    const updatedWorship = await this.worshipDomainService.findWorshipById(
      church,
      targetWorship.id,
      qr,
    );

    return new PatchWorshipResponseDto(updatedWorship);
  }

  async deleteWorshipById(
    churchId: number,
    worshipId: number,
    qr: QueryRunner,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const targetWorship = await this.worshipDomainService.findWorshipModelById(
      church,
      worshipId,
      qr,
    );

    await this.worshipDomainService.deleteWorship(targetWorship, qr);

    // 예배 대상 그룹 중간 테이블 삭제
    await this.worshipTargetGroupDomainService.deleteWorshipTargetGroupCascade(
      targetWorship,
      qr,
    );

    // 예배 대상 교인 정보 삭제
    await this.worshipEnrollmentDomainService.deleteEnrollmentCascade(
      targetWorship,
      qr,
    );

    return new DeleteWorshipResponseDto(
      new Date(),
      targetWorship.id,
      targetWorship.title,
      true,
    );
  }

  private async handleTargetGroupChange(
    church: ChurchModel,
    targetWorship: WorshipModel,
    worshipTargetGroupIds: number[],
    qr: QueryRunner,
  ) {
    // 현재 예배 대상 그룹
    const currentWorshipTargetGroupIdSet = new Set(
      targetWorship.worshipTargetGroups.map((group) => group.groupId),
    );

    const toCreateWorshipTargetGroupIds: number[] = [];

    // 생성할 그룹, 삭제할 그룹 파악
    worshipTargetGroupIds.forEach((newGroupId) => {
      // 새 그룹 ID 가 없으면 생성
      if (!currentWorshipTargetGroupIdSet.has(newGroupId)) {
        toCreateWorshipTargetGroupIds.push(newGroupId);
      }

      // 새 그룹 ID 가 있으면 currentWorship 에서 삭제
      else if (currentWorshipTargetGroupIdSet.has(newGroupId)) {
        currentWorshipTargetGroupIdSet.delete(newGroupId);
      }
    });

    // 현재 예배 대상 그룹 배열에 남은 그룹들을 삭제
    const toDeleteWorshipTargetGroupIds: number[] = Array.from(
      currentWorshipTargetGroupIdSet,
    );

    // 대상 그룹이 삭제해야 하는 경우 --> WorshipTargetGroupModel 물리 삭제
    toDeleteWorshipTargetGroupIds.length > 0 &&
      (await this.worshipTargetGroupDomainService.deleteWorshipTargetGroup(
        targetWorship,
        toDeleteWorshipTargetGroupIds,
        qr,
      ));

    // 새로운 대상 그룹
    if (toCreateWorshipTargetGroupIds.length > 0) {
      const newTargetGroups =
        await this.groupsDomainService.findGroupModelsByIds(
          church,
          toCreateWorshipTargetGroupIds,
          qr,
        );

      await this.worshipTargetGroupDomainService.createWorshipTargetGroup(
        targetWorship,
        newTargetGroups,
        qr,
      );
    }
  }
}
