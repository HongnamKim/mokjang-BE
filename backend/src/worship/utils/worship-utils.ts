import { WorshipModel } from '../entity/worship.entity';
import { TIME_ZONE } from '../../common/const/time-zone.const';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { getDay, startOfDay, subDays } from 'date-fns';
import { WorshipGroupIdsVo } from '../vo/worship-group-ids.vo';
import { PermissionScopeIdsVo } from '../../permission/vo/permission-scope-ids.vo';
import { ForbiddenException } from '@nestjs/common';

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

export function getIntersection(
  worshipGroupIds: WorshipGroupIdsVo,
  permissionScope: PermissionScopeIdsVo,
) {
  /**
   * WorshipGroupIds
   * case 1. groupIds: [1, 2, 3], isAllGroups: false --> 전체 대상 예배 + 필터링 O or 일부 대상 예배 + 필터링 X or 일부 대상 예배 + 필터링 O
   * - 두 객체의 groupIds 의 교집합
   * case 2. groupIds: [1, 2, 3, 4, 5], isAllGroups: true --> 전체 대상 예배 + 필터링 X
   * - 요청자 권한 범위로 좁혀야 함.
   * case 3. groupIds: [], isAllGroups: false --> 그룹없음을 조회 요청
   * - 요청자에게 전체권한 범위가 있는지 확인
   */

  // 전체 범위 관리자 --> 요청한대로 조회
  if (permissionScope.isAllGroups) {
    return worshipGroupIds;
  }

  // 일부 범위 관리자 검증

  if (worshipGroupIds.isAllGroups) {
    return new WorshipGroupIdsVo(permissionScope.groupIds, false);
  }

  // 그룹 없는 교인들 필터링 요청 시 --> 전체 권한
  if (worshipGroupIds.groupIds.length === 0) {
    if (!permissionScope.isAllGroups) {
      throw new ForbiddenException('전체 권한 없음');
    }

    return worshipGroupIds;
  }

  const targetGroupIdSet = new Set(worshipGroupIds.groupIds);

  const allowedGroupIds = permissionScope.groupIds.filter((groupId) =>
    targetGroupIdSet.has(groupId),
  );

  return new WorshipGroupIdsVo(allowedGroupIds, false);
}
