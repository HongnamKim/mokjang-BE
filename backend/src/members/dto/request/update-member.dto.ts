import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateMemberDto } from './create-member.dto';

export class UpdateMemberDto extends PartialType(
  OmitType(CreateMemberDto, [
    //'name',
    //'mobilePhone',
    'familyMemberId',
    'relation',
  ]),
) {}
