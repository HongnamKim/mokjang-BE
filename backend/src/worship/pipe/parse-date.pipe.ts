import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { fromZonedTime } from 'date-fns-tz';
import { TIME_ZONE } from '../../common/const/time-zone.const';

export class ParseDatePipe implements PipeTransform {
  private static readonly DATE_REGEX: RegExp = /^\d{4}-\d{2}-\d{2}$/;

  constructor(private readonly timeZone: TIME_ZONE = TIME_ZONE.SEOUL) {}

  transform(value: string, metadata: ArgumentMetadata): any {
    if (!ParseDatePipe.DATE_REGEX.test(value.trim())) {
      throw new BadRequestException(
        '날짜는 YYYY-MM-DD 형식의 문자열이어야 합니다.',
      );
    }

    const parsed = fromZonedTime(value + 'T00:00:00.000', this.timeZone);

    if (isNaN(parsed.getTime())) {
      throw new BadRequestException('유효하지 않은 날짜 형식입니다.');
    }

    return parsed;
  }
}
