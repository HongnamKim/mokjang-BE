import { Transform } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';

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
