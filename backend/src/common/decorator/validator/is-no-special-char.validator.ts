import { Matches } from 'class-validator';

export function IsNoSpecialChar() {
  return Matches(/^[a-zA-Z0-9ㄱ-힣 \-]+$/, {
    message: '특수문자는 사용할 수 없습니다.',
  });
}
