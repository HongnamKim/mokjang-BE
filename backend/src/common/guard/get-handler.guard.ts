import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class GetHandlerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const targetHandler = context.getHandler().name;

    const targetClass = context.getClass().name;

    console.log(`targetClass: ${targetClass}`);
    console.log(`targetHandler: ${targetHandler}`);
    console.log('-------------------------------------------------');

    return true;
  }
}
