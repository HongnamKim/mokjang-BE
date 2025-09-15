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

/**
 *
 * @param defaultWorshipTargetGroupIds
 * @param permissionScopeGroupIds
 */
export function getIntersectionGroupIds(
  defaultWorshipTargetGroupIds: number[],
  permissionScopeGroupIds: number[],
) {
  if (!defaultWorshipTargetGroupIds) {
    // 요청 그룹이 없고, 예배 대상이 전체인 경우
    // 요청자의 권한 범위 전체 --> number[] | undefined
    return permissionScopeGroupIds;
  }

  // 요청 그룹이 특정된 경우 (요청 그룹이 있거나, 예배 대상이 있는 경우)
  if (!permissionScopeGroupIds) {
    // 요청자의 권한 범위가 전체인 경우
    // 특정 예배 대상 그룹
    return defaultWorshipTargetGroupIds;
  }

  const targetGroupIdSet = new Set(defaultWorshipTargetGroupIds);

  return permissionScopeGroupIds.filter((scopeGroupId) =>
    targetGroupIdSet.has(scopeGroupId),
  );
}
