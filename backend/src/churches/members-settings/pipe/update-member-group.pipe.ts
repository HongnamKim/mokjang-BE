import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  PipeTransform,
} from '@nestjs/common';
import { UpdateMemberGroupDto } from '../dto/update-member-group.dto';

@Injectable()
export class UpdateMemberGroupPipe implements PipeTransform {
  transform(value: any): any {
    if (!(value instanceof UpdateMemberGroupDto)) {
      throw new InternalServerErrorException(
        '소그룹 업데이트 요청 흐름에 사용해야 함.',
      );
    }

    const dto = value as UpdateMemberGroupDto;

    if (!dto.isDeleteGroup && !dto.groupId) {
      throw new BadRequestException(
        '소그룹 추가/변경 요청 시 groupId 값이 필요합니다.',
      );
    }

    return dto;
  }
}
