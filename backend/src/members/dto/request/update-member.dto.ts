import { OmitType } from '@nestjs/swagger';
import { CreateMemberDto } from './create-member.dto';

export class UpdateMemberDto extends OmitType(CreateMemberDto, [
  //'name',
  //'mobilePhone',
  'familyMemberId',
  'relation',
]) {}
