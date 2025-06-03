import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DomainType } from '../const/domain-type.enum';
import { MAX_PERMISSION_TEMPLATE_COUNT } from '../constraints/permission.constraints';

export const ApiGetPermissionUnits = () =>
  applyDecorators(
    ApiOperation({
      summary: '권한 단위 조회',
      description:
        '<h2>서비스 내의 컨트롤할 수 있는 도메인의 작업을 조회합니다.</h2>' +
        '<p><a href="https://test-khn.atlassian.net/wiki/x/mwD6Ag">세부 문서</a></p>' +
        '<p>서비스 내의 모든 교회가 공통으로 갖는 값으로 churchId 는 아무 값을 넣어도 상관 없습니다.</p>' +
        '<p>사용자는 이 값에 대해 쓰기 권한이 없습니다.</p>' +
        '<p>서버 시작 시 자동 생성되는 값입니다.</p>',
    }),
    ApiQuery({
      name: 'domain',
      description: '도메인 종류',
      enum: DomainType,
      required: false,
    }),
  );

export const ApiGetPermissionTemplates = () =>
  applyDecorators(
    ApiOperation({
      summary: '권한 유형 조회',
      description:
        '<h2>교회 내의 권한 유형을 조회합니다.</h2>' +
        '<a href="https://test-khn.atlassian.net/wiki/x/YgD8Ag">세부 문서</a>',
    }),
  );

export const ApiPostPermissionTemplates = () =>
  applyDecorators(
    ApiOperation({
      summary: '권한 유형 생성',
      description:
        '<h2>교회 내의 권한 유형을 생성합니다.</h2>' +
        '<p><a href="https://test-khn.atlassian.net/wiki/x/bgD8Ag">세부 문서</a></p>' +
        '<h3>제약 사항</h3>' +
        `<p>교회 당 최대 생성 가능 횟수: ${MAX_PERMISSION_TEMPLATE_COUNT}</p>` +
        '<p>권한 유형 이름 중복 불가</p>' +
        '<p>unitIds 빈 배열 불가</p>',
    }),
  );

export const ApiPostSamplePermissionTemplates = () =>
  applyDecorators(
    ApiOperation({
      summary: '샘플 권한 유형 생성',
      description:
        '<h2>사용자의 이해를 돕기 위한 샘플 권한 유형을 생성합니다.</h2>' +
        '<p><a href="https://test-khn.atlassian.net/wiki/x/fAD7Ag">세부 문서</a></p>' +
        '<p>1. 교육 관리자(샘플) --> education 도메인의 CRUD 권한</p>' +
        '<p>2. 심방 관리자(샘플) --> visitation 도메인의 CRUD 권한</p>',
    }),
  );

export const ApiGetPermissionTemplateById = () =>
  applyDecorators(
    ApiOperation({
      summary: '권한 유형 단건 조회',
      description:
        '<h2>교회의 권한 유형 상세 정보를 조회합니다.</h2>' +
        '<p><a href="https://test-khn.atlassian.net/wiki/x/ewD8Ag">세부 문서</a></p>',
    }),
  );

export const ApiPatchPermissionTemplate = () =>
  applyDecorators(
    ApiOperation({
      summary: '권한 유형 수정',
      description:
        '<h2>교회의 권한 유형을 수정합니다.</h2>' +
        '<p><a href="https://test-khn.atlassian.net/wiki/x/jgD7Ag">세부 문서</a></p>',
    }),
  );

export const ApiDeletePermissionTemplate = () =>
  applyDecorators(
    ApiOperation({
      summary: '권한 유형 삭제',
      description:
        '<h2>권한 유형을 삭제합니다.</h2>' +
        '<p><a href="https://test-khn.atlassian.net/wiki/x/iAD8Ag">세부 문서</a></p>',
    }),
  );
