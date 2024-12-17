import { CreateMemberDto } from '../../members/dto/create-member.dto';
import { OmitType } from '@nestjs/swagger';

export class SubmitRequestInfoDto extends OmitType(CreateMemberDto, [
  'guidedById',
  'familyMemberId',
  'relation',
]) {}
