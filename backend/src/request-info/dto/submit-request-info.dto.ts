import { OmitType } from '@nestjs/swagger';
import { CreateMemberDto } from '../../members/dto/request/create-member.dto';

export class SubmitRequestInfoDto extends OmitType(CreateMemberDto, [
  'registeredAt',
  'guidedById',
  'familyMemberId',
  'relation',
]) {}
