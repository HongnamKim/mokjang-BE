import { Transform } from 'class-transformer';

export function RemoveSpaces() {
  return Transform(({ value }) =>
    value ? value.replace(/\s+/g, ' ').trim() : value,
  );
}
