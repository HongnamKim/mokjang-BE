import { WorshipModel } from '../entity/worship.entity';
import { TIME_ZONE } from '../../common/const/time-zone.const';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { getDay, startOfDay, subDays } from 'date-fns';

export function getRecentSessionDate(
  worship: WorshipModel,
  timeZone: TIME_ZONE,
) {
  const nowKst = toZonedTime(new Date(), timeZone);
  const currentDayOfWeek = getDay(nowKst);

  const worshipDay = worship.worshipDay;
  let daysToLastWorship = currentDayOfWeek - worshipDay;

  if (daysToLastWorship < 0) {
    daysToLastWorship += 7;
  } else if (daysToLastWorship === 0) {
    daysToLastWorship = 0;
  }

  const lastWorshipDateKst = subDays(startOfDay(nowKst), daysToLastWorship);

  return fromZonedTime(lastWorshipDateKst, timeZone);
}
