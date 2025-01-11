import { Transform } from 'class-transformer';

export function TransformName() {
  return Transform(({ value }) => value.replace(/\s+/g, ' ').trim());
}

/*value
.trim()
.split('  ')
.filter((char: string) => char)
.map((char: string) => char.trim())
.join(' '),*/
