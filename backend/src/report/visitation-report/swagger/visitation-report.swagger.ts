import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const ApiGetVisitationReports = () =>
  applyDecorators(
    ApiOperation({
      summary: '심방 보고 목록 조회',
      description: '',
    }),
  );

export const ApiGetVisitationReportById = () =>
  applyDecorators(
    ApiOperation({
      summary: '심방 보고 단건 조회',
      description: '',
    }),
  );

export const ApiPatchVisitationReport = () =>
  applyDecorators(
    ApiOperation({
      summary: '심방 보고 수정',
      description:
        '<h2>업무 보고를 수정합니다.</h2>' +
        '<p>isRead : 읽음 여부를 수정합니다.</p>' +
        '<p>isConfirmed : 보고 확인 여부를 수정합니다.</p>',
    }),
  );

export const ApiDeleteVisitationReport = () =>
  applyDecorators(
    ApiOperation({
      summary: '심방 보고 삭제',
    }),
  );
