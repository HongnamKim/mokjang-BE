import { Transform } from 'class-transformer';

export function TransformStartDate() {
  return Transform(({ value }) => new Date(value.setHours(0, 0, 0, 0)));
}
