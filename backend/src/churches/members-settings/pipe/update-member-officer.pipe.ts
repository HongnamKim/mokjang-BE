import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  PipeTransform,
} from '@nestjs/common';
import { UpdateMemberOfficerDto } from '../dto/update-member-officer.dto';

@Injectable()
export class UpdateMemberOfficerPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): UpdateMemberOfficerDto {
    if (!(value instanceof UpdateMemberOfficerDto)) {
      throw new InternalServerErrorException(
        '직분 업데이트 요청 흐름에 사용해야 함.',
      );
    }

    const dto = value as UpdateMemberOfficerDto;

    // 직분 추가/변경 요청인 경우 officerId 가 넘어오지 않음.
    if (!dto.isDeleteOfficer && !dto.officerId) {
      throw new BadRequestException(
        '직분 추가/변경 요청 시 officerId 값이 필요합니다.',
      );
    }

    return dto;
  }
}
