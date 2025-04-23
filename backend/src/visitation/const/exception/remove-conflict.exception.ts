import { ConflictException, HttpStatus } from '@nestjs/common';
import { HttpStatusText } from '../../../common/const/http-status-text.const';

export class RemoveConflictException extends ConflictException {
  constructor(message: string, notExistIds: number[]) {
    super({
      message,
      notExistIds,
      error: HttpStatusText[HttpStatus.CONFLICT],
      statusCode: HttpStatus.CONFLICT,
    });
  }
}
