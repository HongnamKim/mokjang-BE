import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const ApiGetSessionAttendance = () =>
  applyDecorators(
    ApiOperation({
      summary: '교육 세션의 출석부 조회',
      description:
        '<p><h2>교육 세션의 출석 정보를 조회합니다.</h2></p>' +
        '<p>기본 조건: 교육 등록 ID 기준, 오름차순</p>' +
        '<p>order(정렬 조건): educationEnrollmentId, isPresent, createdAt, updatedAt</p>' +
        '<p>orderDirection(내림차순 / 오름차순): desc, DESC, asc, ASC</p>' +
        '<p><b>정렬 우선 순위</b></p>' +
        '<p>1. DTO의 정렬 조건</p>' +
        '<p>2. 생성일 (출석 정보 ID)</p>',
    }),
  );

export const ApiLoadSessionAttendance = () =>
  applyDecorators(
    ApiOperation({
      deprecated: true,
      summary: '교육 세션의 출석부 생성/새로고침',
      description: 'EducationTerm 에서 전체 출석부 동기화 기능 이동 및 변경',
    }),
  );

export const ApiPatchSessionAttendance = () =>
  applyDecorators(
    ApiOperation({
      summary: '출석 정보 수정',
      description:
        '<p><h2>출석 정보를 수정합니다.</h2></p>' +
        '<p>수정 가능 요소</p>' +
        '<p>1. 출석 여부 (isPresent)</p>' +
        '<p>2. 비고 (note)</p>' +
        '<p>수정된 출석 여부에 따라 EducationEnrollment 의 attendanceCount 가 변경됩니다.</p>' +
        '<p>빈 문자열을 통해 비고 내용을 삭제할 수 있습니다.</p>',
    }),
  );
