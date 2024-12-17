import {
  ArgumentMetadata,
  Injectable,
  InternalServerErrorException,
  PipeTransform,
} from '@nestjs/common';
import { CreateMemberDto } from '../dto/create-member.dto';
import { FamilyRelation } from '../const/family-relation.const';
import { CreateRequestInfoDto } from '../../request-info/dto/create-request-info.dto';

@Injectable()
export class FamilyRelationPipe implements PipeTransform {
  transform(
    value: any,
    metadata: ArgumentMetadata,
  ): CreateMemberDto | CreateRequestInfoDto {
    if (
      !(value instanceof CreateMemberDto) &&
      !(value instanceof CreateRequestInfoDto)
    ) {
      throw new InternalServerErrorException(
        'CreateMemberDto 또는 CreateRequestInfoDto 가 사용되는 요청 흐름의 해당 DTO 를 받는 @Body 데코레이터에서만 사용 가능',
      );
    }

    if (value.familyMemberId && !value.relation) {
      value.relation = FamilyRelation.DEFAULT;
    }

    return value;
  }
}
