import { Transform } from 'class-transformer';

export function TransformEndDate() {
  return Transform(({ value }) => new Date(value.setHours(23, 59, 59, 99)));
}
