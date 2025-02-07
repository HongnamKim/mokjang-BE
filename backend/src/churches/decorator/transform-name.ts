import { Transform } from 'class-transformer';

export function TransformName() {
  return Transform(({ value }) => value.replace(/\s+/g, ' ').trim());
}
