import { MAX_PERMISSION_TEMPLATE_COUNT } from '../constraints/permission.constraints';

export const PermissionException = {
  ALREADY_EXIST: '이미 존재하는 권한 유형 이름입니다.',
  CANNOT_DELETE: '해당 권한 유형에 속한 관리자가 있습니다.',

  NOT_EXIST_PERMISSION_UNITS: (missingIds: number[]) =>
    `다음 권한 단위 ID는 존재하지 않습니다: ${missingIds.join(', ')}`,
  NOT_FOUND: '존재하지 않는 권한 유형입니다.',

  UPDATE_ERROR: '권한 유형 업데이트 도중 에러 발생',
  DELETE_ERROR: '권한 유형 삭제 도중 에러 발생',

  EXCEED_MAX_PERMISSION_TEMPLATE_COUNT: `생성 가능한 권한 유형 최대 생성 개수를 초과했습니다. (최대 개수: ${MAX_PERMISSION_TEMPLATE_COUNT})`,
};
