export const VisitationException = {
  NOT_FOUND: '심방 데이터를 찾을 수 없습니다.',
  INVALID_INSTRUCTOR: '심방 진행자로 등록할 수 없는 교인입니다.',
  UPDATE_ERROR: '심방 데이터 업데이트 도중 에러 발생',
  DELETE_ERROR: '심방 데이터 삭제 도중 에러 발생',

  ALREADY_EXIST_TARGET_MEMBER: (alreadyExistMember: number | number[]) =>
    `이미 존재하는 심방 대상자입니다. 존재하는 교인 id: [${alreadyExistMember}]`,
  NOT_EXIST_DELETE_TARGET_MEMBER: (notExistMemberId: number | number[]) =>
    `삭제 대상자가 심방 대상자에 포함되어 있지 않습니다. 존재하지 않는 교인 id: [${notExistMemberId}]`,
};

export const VisitationDetailException = {
  NOT_FOUND: '해당 심방 세부 데이터를 찾을 수 없습니다.',
  ALREADY_EXIST: '이미 존재하는 심방 세부 데이터입니다.',
  UPDATE_ERROR: '심방 세부 데이터 업데이트 도중 에러 발생',
  DELETE_ERROR: '심방 세부 데이터 삭제 도중 에러 발생',
};
