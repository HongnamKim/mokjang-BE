import { TIME_ZONE } from '../common/const/time-zone.const';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { endOfDay, startOfDay } from 'date-fns';
import { BadRequestException } from '@nestjs/common';

export class HistoryUpdateDate {
  constructor(
    public readonly startDate: Date | undefined,
    public readonly endDate: Date | undefined,
  ) {}
}

export function convertHistoryStartDate(
  startDateStr: string,
  timeZone: TIME_ZONE,
) {
  return fromZonedTime(startOfDay(startDateStr), timeZone);
}

export function convertHistoryEndDate(endDateStr: string, timeZone: TIME_ZONE) {
  return fromZonedTime(endOfDay(endDateStr), timeZone);
}

export function convertHistoryDate(
  startDateStr: string | undefined,
  endDateStr: string | undefined,
  timeZone: TIME_ZONE,
) {
  const startDate = startDateStr
    ? fromZonedTime(startOfDay(startDateStr), timeZone)
    : undefined;
  const endDate = endDateStr
    ? fromZonedTime(endOfDay(endDateStr), timeZone)
    : undefined;

  const today = fromZonedTime(
    endOfDay(toZonedTime(new Date(), timeZone)),
    timeZone,
  );

  if (startDate) {
    if (today < startDate) {
      throw new BadRequestException(
        '이력 시작 날짜는 현재 날짜를 넘어설 수 없습니다.',
      );
    }
  }
  if (endDate) {
    if (today < endDate) {
      throw new BadRequestException(
        '이력 종료 날짜는 현재 날짜를 넘어설 수 없습니다.',
      );
    }
  }

  if (startDate && endDate) {
    if (startDate > endDate) {
      throw new BadRequestException(
        '이력 시작 날짜는 종료 날짜를 넘어설 수 없습니다.',
      );
    }
  }

  return new HistoryUpdateDate(startDate, endDate);
}

export function getHistoryStartDate(timeZone: TIME_ZONE) {
  return fromZonedTime(startOfDay(toZonedTime(new Date(), timeZone)), timeZone);
}

export function getHistoryEndDate(timeZone: TIME_ZONE) {
  return fromZonedTime(endOfDay(toZonedTime(new Date(), timeZone)), timeZone);
}
