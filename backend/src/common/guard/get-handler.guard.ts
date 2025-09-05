import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';

@Injectable()
export class GetHandlerGuard implements CanActivate {
  private readonly logger = new Logger('HandlerGuard');

  canActivate(context: ExecutionContext): boolean {
    const targetHandler = context.getHandler().name;

    const targetClass = context.getClass().name;

    this.logger.log(
      `targetClass: ${targetClass}, targetHandler: ${targetHandler}`,
    );

    return true;
  }
}
