import { Inject, Injectable } from '@nestjs/common';
import {
  IORDER_DOMAIN_SERVICE,
  IOrderDomainService,
} from '../subscription-domain/interface/order-domain.service.interface';

@Injectable()
export class OrderService {
  constructor(
    @Inject(IORDER_DOMAIN_SERVICE)
    private readonly orderService: IOrderDomainService,
  ) {}
}
