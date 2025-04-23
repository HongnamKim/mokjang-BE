export const VisitationException = {
  NOT_FOUND: '심방 데이터를 찾을 수 없습니다.',
  INVALID_INSTRUCTOR: '심방 진행자로 등록할 수 없는 교인입니다.',
  INVALID_RECEIVER: '심방 피보고자로 등록할 수 없는 교인입니다.',
  UPDATE_ERROR: '심방 데이터 업데이트 도중 에러 발생',
  DELETE_ERROR: '심방 데이터 삭제 도중 에러 발생',

  ALREADY_EXIST_TARGET_MEMBER: `이미 존재하는 심방 대상자입니다. `,
  NOT_EXIST_DELETE_TARGET_MEMBER: `삭제 대상자가 심방 대상자에 포함되어 있지 않습니다. `,

  MEMBER_RELATION_ERROR: '심방 대상자 불러오기 실패',

  INVALID_REPORT_RECEIVER:
    '피보고자로 등록할 수 없는 교인이 포함되어 있습니다.',
  ALREADY_REPORTED_MEMBER: '이미 피보고자로 등록된 교인입니다.',
  NOT_EXIST_REPORTED_MEMBER: '삭제 대상자가 피보고자에 포함되어 있지 않습니다.',
};

export const VisitationDetailException = {
  NOT_FOUND: '해당 심방 세부 데이터를 찾을 수 없습니다.',
  ALREADY_EXIST: '이미 존재하는 심방 세부 데이터입니다.',
  UPDATE_ERROR: '심방 세부 데이터 업데이트 도중 에러 발생',
  DELETE_ERROR: '심방 세부 데이터 삭제 도중 에러 발생',
};
