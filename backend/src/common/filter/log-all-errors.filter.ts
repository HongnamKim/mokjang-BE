import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

@Catch()
export class LogAllErrorsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    if (exception instanceof AggregateError) {
      console.error('AggregateError:', exception.message, exception.stack);
      for (const [i, e] of exception.errors.entries()) {
        console.error(` └─ [${i}]`, e?.name, e?.message, e?.stack);
      }
    } else {
      console.error(
        'Error:',
        exception?.name,
        exception?.message,
        exception?.stack,
      );
    }
    // 기존 응답 처리 로직…
  }
}
