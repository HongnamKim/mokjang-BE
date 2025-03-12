import { IsNumber } from 'class-validator';

export class LinkMemberToUserDto {
  @IsNumber()
  memberId: number;
}
