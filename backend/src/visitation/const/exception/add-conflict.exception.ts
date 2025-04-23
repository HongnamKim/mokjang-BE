import { ConflictException, HttpStatus } from '@nestjs/common';
import { HttpStatusText } from '../../../common/const/http-status-text.const';

export class AddConflictException extends ConflictException {
  constructor(message: string, duplicatedIds: number[]) {
    super({
      message,
      duplicatedIds,
      error: HttpStatusText[HttpStatus.CONFLICT],
      statusCode: HttpStatus.CONFLICT,
    });
  }
}
