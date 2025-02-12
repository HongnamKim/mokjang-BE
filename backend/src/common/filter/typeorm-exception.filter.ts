import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const error: any = exception;

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '데이터 저장 실패';
    let errorType = 'Internal Server Error';

    if (error.code === '23505') {
      statusCode = HttpStatus.BAD_REQUEST;
      errorType = 'Bad Request';
      message = '이미 존재하는 데이터입니다. 다른 값을 입력해주세요.';
    } else if (error.code === '23503') {
      statusCode = HttpStatus.BAD_REQUEST;
      errorType = 'Bad Request';
      message = '연관된 데이터가 존재하여 삭제할 수 없습니다.';
    }

    response.status(HttpStatus.BAD_REQUEST).json({
      message,
      error: errorType,
      statusCode,
    });
  }
}
