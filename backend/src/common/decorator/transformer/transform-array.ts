import { Transform } from 'class-transformer';

/**
 * Number Array 형태로 변환
 * @constructor
 */
export function TransformNumberArray() {
  return Transform(({ value }) => {
    if (!Array.isArray(value)) {
      return [Number(value)];
    }
    return [...new Set(value)].map(Number);
  });
}

/**
 * String Array 형태로 변환
 * @constructor
 */
export function TransformStringArray() {
  return Transform(({ value }) => {
    if (!Array.isArray(value)) {
      return [value];
    }
    return [...new Set(value)];
  });
}
