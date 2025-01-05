import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  PipeTransform,
} from '@nestjs/common';
import { UpdateEducationHistoryDto } from '../dto/education/update-education-history.dto';

@Injectable()
export class UpdateEducationHistoryPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): any {
    if (!(value instanceof UpdateEducationHistoryDto)) {
      throw new InternalServerErrorException(
        '교육이수 이력 업데이트 요청 흐름에 사용해야 함.',
      );
    }

    const dto = value as UpdateEducationHistoryDto;

    if (dto.educationId && !dto.status) {
      throw new BadRequestException(
        '교육 항목 변경 시 status 값을 반드시 포함해야 합니다.',
      );
    }

    return dto;
  }
}
