import { GroupRole } from '../../management/groups/const/group-role.enum';
import { MemberModel } from '../entity/member.entity';

export class MemberDto {
  public readonly id: number;
  public readonly registeredAt: Date;
  public readonly profileImageUrl: string;
  public readonly name: string;
  public readonly mobilePhone: string;
  public readonly isLunar: boolean;
  public readonly isLeafMonth: boolean;
  public readonly birth: Date | null;
  public readonly ministryGroupRole: GroupRole;
  public readonly groupRole: GroupRole;
  public readonly officer: { id: number; name: string } | null;
  public readonly group: { id: number; name: string } | null;

  constructor(member: MemberModel) {
    this.id = member.id;
    this.registeredAt = member.registeredAt;
    this.profileImageUrl = member.profileImageUrl;
    this.name = member.name;
    this.mobilePhone = member.mobilePhone;
    this.isLunar = member.isLunar;
    this.isLeafMonth = member.isLeafMonth;
    this.birth = member.birth;
    this.ministryGroupRole = member.ministryGroupRole;
    this.groupRole = member.groupRole;
    this.officer = member.officer
      ? { id: member.officer.id, name: member.officer.name }
      : null;
    this.group = member.group
      ? { id: member.group.id, name: member.group.name }
      : null;
  }
}
