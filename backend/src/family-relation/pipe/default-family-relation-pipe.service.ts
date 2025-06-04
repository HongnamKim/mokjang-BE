import {
  ArgumentMetadata,
  Injectable,
  InternalServerErrorException,
  PipeTransform,
} from '@nestjs/common';
import { CreateMemberDto } from '../../members/dto/request/create-member.dto';
import { FamilyRelationConst } from '../family-relation-domain/const/family-relation.const';
import { CreateRequestInfoDto } from '../../request-info/dto/create-request-info.dto';

/**
 * 가족을 추가하지만 관계가 입력되지 않은 경우 기본값으로 관계를 지정
 */
@Injectable()
export class DefaultFamilyRelationPipe implements PipeTransform {
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
      value.relation = FamilyRelationConst.FAMILY;
    }

    return value;
  }
}
