import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';

export class ParseDatePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): any {
    const parsed = new Date(new Date(value).setHours(0, 0, 0, 0));

    if (isNaN(parsed.getTime())) {
      throw new BadRequestException('유효하지 않은 날짜 형식입니다.');
    }

    return parsed;
  }
}
