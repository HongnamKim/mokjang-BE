import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const ApiGetTaskReports = () =>
  applyDecorators(
    ApiOperation({
      summary: '업무 보고 목록 조회',
      description:
        '<h2>해당 교인의 업무 보고 목록을 조회힙니다.</h2>' + '<p></p>',
    }),
  );

export const ApiGetTaskReportById = () =>
  applyDecorators(
    ApiOperation({
      summary: '업무 보고 단건 조회',
      description: '<h2>업무 보고 상세 내용을 조회합니다.</h2>',
    }),
  );

export const ApiPatchTaskReport = () =>
  applyDecorators(
    ApiOperation({
      summary: '업무 보고 수정',
      description:
        '<h2>업무 보고를 수정합니다.</h2>' +
        '<p>isRead : 읽음 여부를 수정합니다.</p>' +
        '<p>isConfirmed : 보고 확인 여부를 수정합니다.</p>',
    }),
  );

export const ApiDeleteTaskReport = () =>
  applyDecorators(
    ApiOperation({
      summary: '업무 보고 삭제',
    }),
  );
