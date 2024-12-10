import { BadRequestException, Injectable } from '@nestjs/common';
import { MembersService } from '../../members/service/members.service';
import { GroupsService } from '../../settings/service/groups.service';
import { QueryRunner } from 'typeorm';
import { UpdateMemberGroupDto } from '../dto/update-member-group.dto';

@Injectable()
export class MemberGroupService {
  constructor(
    private readonly membersService: MembersService,
    private readonly groupsService: GroupsService,
  ) {}

  async updateMemberGroup(
    churchId: number,
    memberId: number,
    dto: UpdateMemberGroupDto,
    qr: QueryRunner,
  ) {
    const member = await this.membersService.getMemberModelById(
      churchId,
      memberId,
      { group: true, church: true },
    );

    // 이미 등록된 그룹을 등록하려고 시도
    if (!dto.isDeleteGroup && member.groupId === dto.groupId) {
      throw new BadRequestException('이미 등록된 소그룹입니다.');
    }

    // 등록되지 않은 그룹을 삭제 시도
    if (dto.isDeleteGroup && !member.groupId) {
      throw new BadRequestException(
        '등록되지 않은 소그룹을 삭제할 수 없습니다.',
      );
    }

    // 이전 그룹
    const previousGroup = member.group;

    // 변경할 그룹
    const newGroup = await this.groupsService.getGroupById(
      churchId,
      dto.groupId,
      qr,
    );

    await this.membersService.updateMemberGroup(member, dto, qr);

    // 이전 그룹이 있을 경우 해당 그룹의 인원수 감소
    if (previousGroup) {
      await this.groupsService.decrementMembersCount(previousGroup.id, qr);
    }

    // 그룹 등록 시 해당 그룹의 인원수 증가
    if (!dto.isDeleteGroup) {
      await this.groupsService.incrementMembersCount(newGroup.id, qr);
    }

    return this.membersService.getMemberById(
      churchId,
      memberId,
      { group: true },
      qr,
    );
  }
}
