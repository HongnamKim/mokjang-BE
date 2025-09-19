import { ConflictException, HttpStatus } from '@nestjs/common';
import { HttpStatusText } from '../const/http-status-text.const';

export class AddConflictException extends ConflictException {
  constructor(message: string, conflictIds: number[]) {
    super({
      message,
      conflictIds,
      error: HttpStatusText[HttpStatus.CONFLICT],
      statusCode: HttpStatus.CONFLICT,
    });
  }
}

export class AddConflictExceptionV2 extends ConflictException {
  constructor(
    message: string,
    conflicts: { receiverName: string; reason: string }[],
  ) {
    super({
      message,
      conflicts,
      error: HttpStatusText[HttpStatus.CONFLICT],
      statusCode: HttpStatus.CONFLICT,
    });
  }
}

export class AddMemberConflictException extends ConflictException {
  constructor(
    message: string,
    conflictMembers: { id: number; name: string }[],
  ) {
    super({
      message,
      conflictMembers,
      error: HttpStatusText[HttpStatus.CONFLICT],
      statusCode: HttpStatus.CONFLICT,
    });
  }
}
