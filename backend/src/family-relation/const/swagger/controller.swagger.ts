import { ApiOperation } from '@nestjs/swagger';

export const ApiGetFamilyMember = () =>
  ApiOperation({
    summary: '교인 가족 관계 조회',
    description: '<h2>교인의 가족 관계를 조회합니다.</h2>',
  });

export const ApiPostFamilyMember = () =>
  ApiOperation({
    summary: '교인 가족 관계 추가',
    description: '<h2>교인의 가족 관계를 추가합니다.</h2>',
  });

export const ApiFetchFamilyMember = () =>
  ApiOperation({
    deprecated: true,
    summary: '가족 관계 불러오기',
    description: '<h2>다른 교인의 가족 관계를 해당 교인에게 불러옵니다.</h2>',
  });

export const ApiPatchFamilyMember = () =>
  ApiOperation({
    summary: '교인 가족 관계 수정',
    description: '<h2>교인의 가족 관계를 수정합니다.</h2>',
  });

export const ApiDeleteFamilyMember = () =>
  ApiOperation({
    summary: '교인 가족 관계 삭제',
    description: '<h2>교인의 가족 관계를 삭제합니다.</h2>',
  });
