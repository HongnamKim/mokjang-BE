import { Transform } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';

/**
 * 쿼리 파라미터를 받는 DTO 에서 boolean type 의 프로퍼티를 받는 경우 사용
 * @constructor
 */
export function QueryBoolean() {
  return Transform(
    ({ key, obj }) => {
      const value = obj[key];

      if (value === 'true') return true;
      if (value === 'false') return false;
      throw new BadRequestException(`property ${key} must be a boolean value`);
    },
    { toClassOnly: true },
  );
}
