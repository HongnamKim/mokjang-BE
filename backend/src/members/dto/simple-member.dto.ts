import { SimpleGroupDto } from '../../management/groups/dto/simple-group.dto';
import { SimpleOfficerDto } from '../../management/officers/dto/simple-officer.dto';

export class SimpleMemberDto {
  public readonly id: number;
  public readonly name: string;
  public readonly mobilePhone: string;
  public readonly profileImageUrl: string;
  public readonly birth: Date;
  public readonly isLunar: boolean;
  public readonly isLeafMonth: boolean;
  public readonly group: SimpleGroupDto | null;
  public readonly officer: SimpleOfficerDto | null;

  constructor(
    id: number,
    name: string,
    mobilePhone: string,
    profileImageUrl: string,
    birth: Date,
    isLunar: boolean,
    isLeafMonth: boolean,
    group: SimpleGroupDto | null,
    officer: SimpleOfficerDto | null,
  ) {
    this.id = id;
    this.name = name;
    this.mobilePhone = mobilePhone;
    this.profileImageUrl = profileImageUrl;
    this.birth = birth;
    this.isLunar = isLunar;
    this.isLeafMonth = isLeafMonth;
    this.group = group;
    this.officer = officer;
  }
}
