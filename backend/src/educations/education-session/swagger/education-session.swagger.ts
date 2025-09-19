import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const ApiGetEducationSessions = () =>
  applyDecorators(
    ApiOperation({
      summary: '교육 회차 조회',
      description:
        '<h2>교육 기수 하위의 세션을 조회합니다.</h2>' +
        '<p>정렬 기준: 회차 / 생성일 / 수정일</p>',
    }),
  );

export const ApiPostEducationSessions = () =>
  applyDecorators(
    ApiOperation({
      summary: '교육 회차 생성',
      description:
        '<h2>교육 기수 하위의 세션을 생성합니다.</h2>' +
        '<p><b>name:</b> 세션의 이름  [한글, 알파벳, 숫자, - 사용 가능, 최대 50자 (그 외 특수문자 불가)]</p>' +
        '<p><b>startDate:</b> 세션의 시작 날짜+시간</p>' +
        '<p><b>endDate:</b> 세션의 종료 날짜+시간 [startDate 보다 앞설 수 없음]</p>' +
        '<p><b>inChargeId:</b> 담당자 교인 ID [관리자 권한의 교인만 설정 가능] 선택값</p>' +
        '<p><b>content:</b> 세션 내용 [서식 제외 순수 텍스트 1000자, html 태그로 서식 지정 가능]</p>' +
        '<p><b>status:</b> 세션 진행 상태 [reserve, done, pending]</p>' +
        '<p><b>receiverIds:</b> 보고 대상자 교인 ID 배열 [관리자 권한의 교인만 설정 가능]</p>',
    }),
  );

export const ApiGetEducationSessionById = () =>
  applyDecorators(
    ApiOperation({
      summary: '특정 교육 회차 조회',
      description: '<h2>교육 세션의 상세 내용을 조회합니다.</h2>',
    }),
    ApiResponse({
      example: {
        data: {
          id: 50,
          createdAt: '2025-05-20T05:38:43.949Z',
          updatedAt: '2025-05-21T08:07:33.466Z',
          educationTermId: 9,
          session: 4,
          name: '보고 테스트',
          content: '',
          startDate: '2025-05-20T14:34:02.234Z',
          endDate: '2025-05-20T14:34:02.234Z',
          status: 'reserve',
          inChargeId: 4,
          creatorId: 1,
          inCharge: {
            id: 4,
            name: '최종희',
            officer: {
              id: 3,
              name: '집사',
            },
            group: null,
            groupRole: null,
          },
          creator: {
            id: 1,
            name: '김홍남',
            officer: {
              id: 3,
              name: '집사',
            },
            group: {
              id: 5,
              name: '청년부2',
            },
            groupRole: null,
          },
          reports: [
            {
              id: 26,
              isRead: true,
              isConfirmed: false,
              receiver: {
                id: 1,
                name: '김홍남',
                officer: {
                  id: 3,
                  name: '집사',
                },
                group: {
                  id: 5,
                  name: '청년부2',
                },
                groupRole: null,
              },
            },
            {
              id: 24,
              isRead: false,
              isConfirmed: false,
              receiver: {
                id: 2,
                name: '권우주',
                officer: {
                  id: 1,
                  name: '장로',
                },
                group: null,
                groupRole: null,
              },
            },
          ],
        },
        timestamp: '2025-05-21T17:07:45.867Z',
      },
    }),
  );

export const ApiPatchEducationSession = () =>
  applyDecorators(
    ApiOperation({
      summary: '교육 세션 수정',
      description:
        '<h2>교육 세션을 수정합니다.</h2>' +
        '<p><b>name:</b> 세션의 이름 (string) [한글, 알파벳, 숫자, - 사용 가능, 최대 50자 (그 외 특수문자 불가)]</p>' +
        '<p><b>startDate:</b> 세션의 시작 날짜+시간 (Date) [기존 endDate 보다 늦을 수 없음]</p>' +
        '<p><b>endDate:</b> 세션의 종료 날짜+시간 (Date) [기존 startDate 보다 앞설 수 없음]</p>' +
        '<p><b>inChargeId:</b> 담당자 교인 ID (number) [관리자 권한의 교인만 설정 가능, 담당자 삭제 시 null] 선택값</p>' +
        '<p><b>content:</b> 세션 내용 (string) [서식 제외 순수 텍스트 1000자, html 태그로 서식 지정 가능]</p>' +
        '<p><b>status:</b> 세션 진행 상태 (enum) [reserve, done, pending]</p>',
    }),
  );

export const ApiDeleteEducationSession = () =>
  applyDecorators(
    ApiOperation({
      summary: '교육 세션 삭제',
      description:
        '<h2>교육 세션을 삭제합니다.</h2>' +
        '<p>회차 삭제 시 다른 회차들의 넘버링 자동 수정, 해당 기수의 회차 개수 자동 수정</p>' +
        '<p>해당 세션의 보고 삭제</p>',
    }),
  );

export const ApiAddReportReceivers = () =>
  applyDecorators(
    ApiOperation({
      summary: '보고 대상자 추가',
      description:
        '<h2>교육 세션의 보고 대상자를 추가합니다.</h2>' +
        '<p>recevierIds: 추가할 대상자 교인 ID 배열 (number[]) [관리자 권한의 교인만 설정 가능, 중복된 ID 존재 시 중복 내용 제거]</p>' +
        '<p>이미 등록된 교인을 추가 불가능</p>',
    }),
  );

export const ApiDeleteReportReceivers = () =>
  applyDecorators(
    ApiOperation({
      summary: '보고 대상자 삭제',
      description:
        '<h2>교육 세션의 보고 대상자를 삭제합니다.</h2>' +
        '<p>receiverIds: 삭제할 대상자 교인 ID 배열 (number[]) [중복된 ID 존재 시 중복 내용 제거]</p>' +
        '<p>등록되지 않은 교인 삭제 불가능</p>',
    }),
  );
