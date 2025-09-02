import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { TransactionInterceptor } from '../interceptor/transaction.interceptor';

export const UseTransaction = () =>
  applyDecorators(UseInterceptors(TransactionInterceptor));
