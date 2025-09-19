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
  const today = fromZonedTime(
    endOfDay(toZonedTime(new Date(), timeZone)),
    timeZone,
  );

  const startDate = fromZonedTime(startOfDay(startDateStr), timeZone);

  if (startDate > today) {
    throw new BadRequestException(
      '시작 날짜는 현재 날짜를 넘어설 수 없습니다.',
    );
  }

  return fromZonedTime(startOfDay(startDateStr), timeZone);
}

export function convertHistoryEndDate(endDateStr: string, timeZone: TIME_ZONE) {
  const today = fromZonedTime(
    endOfDay(toZonedTime(new Date(), timeZone)),
    timeZone,
  );

  const endDate = fromZonedTime(endOfDay(endDateStr), timeZone);

  if (endDate > today) {
    throw new BadRequestException(
      '종료 날짜는 현재 날짜를 넘어설 수 없습니다.',
    );
  }

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

export function getStartOfToday(timeZone: TIME_ZONE) {
  return fromZonedTime(startOfDay(toZonedTime(new Date(), timeZone)), timeZone);
}

export function getEndOfToday(timeZone: TIME_ZONE) {
  return fromZonedTime(endOfDay(toZonedTime(new Date(), timeZone)), timeZone);
}

export function getFromDate(date: string, timeZone: TIME_ZONE) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new BadRequestException('YYYY-MM-DD 형식이 아님');
  }

  return fromZonedTime(startOfDay(date), timeZone);
}

export function getToDate(date: string, timeZone: TIME_ZONE) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new BadRequestException('YYYY-MM-DD 형식이 아님');
  }

  return fromZonedTime(endOfDay(date), timeZone);
}
