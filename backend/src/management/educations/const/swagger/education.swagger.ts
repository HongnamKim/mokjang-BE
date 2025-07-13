import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

export const ApiGetEducation = () =>
  applyDecorators(
    ApiOperation({
      summary: '교회의 교육 조회',
      description:
        '<p><h2>교회의 교육 목록을 조회합니다.</h2></p>' +
        '<p>기본 조건: 이름 기준, 오름차순</p>' +
        '<p>order(정렬 조건): name(이름), createdAt(생성일), updatedAt(수정일)</p>' +
        '<p>orderDirection(내림차순 / 오름차순): desc, DESC, asc, ASC</p>' +
        '<p><b>정렬 우선 순위</b></p>' +
        '<p>1. DTO 의 정렬 조건</p>' +
        '<p>2. 생성일</p>',
    }),
  );

export const ApiGetEducationById = () =>
  applyDecorators(
    ApiOperation({
      summary: '교회의 특정 교육 조회',
    }),
  );

export const ApiPostEducation = () =>
  applyDecorators(
    ApiOperation({
      summary: '교회의 교육 생성',
      description:
        '<p><h2>교희의 교육을 생성합니다.</h2></p>' +
        '<p>필수값: 교육 이름</p>' +
        '<p>선택값: 교육 설명</p>' +
        '<p><b>제약 조건</b></p>' +
        '<p>교육 이름: 최대 50자, 연속 공백 불가능, 특수문자 사용불가능 (띄어쓰기, - 허용)</p>' +
        '<p>교육 설명: 최대 300자, 내용이 없는 공백 입력 시 입력을 무시함(undefined 처리)</p>',
    }),
  );

export const ApiGetInProgressEducations = () =>
  applyDecorators(
    ApiOperation({
      summary: '진행중인 교육 조회',
    }),
  );

export const ApiRefreshEducationCount = () =>
  applyDecorators(
    ApiParam({ name: 'churchId' }),
    ApiOperation({
      summary: '교회 교육 개수 새로고침',
    }),
  );

export const ApiPatchEducation = () =>
  applyDecorators(
    ApiOperation({
      summary: '교회의 교육 수정',
      description:
        '<p><h2>교회의 교육을 수정합니다.</h2></p>' +
        '<p>필수값: 없음</p>' +
        '<p>선택값: 교육 이름, 교육 설명</p>' +
        '<p><b>제약 조건</b></p>' +
        '<p>교회의 교육 생성과 동일합니다.</p>',
    }),
  );

export const ApiDeleteEducation = () =>
  applyDecorators(
    ApiOperation({
      summary: '교회의 교육 삭제',
    }),
  );
