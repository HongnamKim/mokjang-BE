export const SETTING_EXCEPTION = {
  POSITION: {
    ALREADY_EXIST: '이미 존재하는 직분입니다.',
    NOT_FOUND: '해당 직분을 찾을 수 없습니다.',
  },
  MINISTRY: {
    ALREADY_EXIST: '이미 존재하는 사역입니다.',
    NOT_FOUND: '해당 사역을 찾을 수 없습니다.',
  },
  GROUP: {
    ALREADY_EXIST: '이미 존재하는 소그룹입니다.',
    NOT_FOUND: (isParent: boolean) =>
      `해당 ${isParent ? '상위 ' : ''}그룹을 찾을 수 없습니다.`,
  },
  EDUCATION: {
    ALREADY_EXIST: '이미 존재하는 교육이수입니다.',
    NOT_FOUND: '해당 교육이수를 찾을 수 없습니다.',
  },
};
