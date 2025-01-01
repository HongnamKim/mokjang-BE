import { Transform } from 'class-transformer';

export function TransformNumberArray() {
  return Transform(({ value }) => {
    if (!Array.isArray(value)) {
      return [Number(value)];
    }
    return [...new Set(value)].map(Number);
  });
}

export function TransformStringArray() {
  return Transform(({ value }) => {
    if (!Array.isArray(value)) {
      return [value];
    }
    return [...new Set(value)];
    //return value;
  });
}
