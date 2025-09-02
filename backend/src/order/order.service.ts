import { Inject, Injectable } from '@nestjs/common';
import {
  IORDER_DOMAIN_SERVICE,
  IOrderDomainService,
} from './order-domain/interface/order-domain.service.interface';
import { UserModel } from '../user/entity/user.entity';
import { GetOrdersDto } from './dto/request/get-orders.dto';
import { GetOrdersPaginationResponseDto } from './dto/response/get-orders-pagination-response.dto';
import { QueryRunner } from 'typeorm';
import { DeleteOrderResponseDto } from './dto/response/delete-order-response.dto';
import { SubscriptionPlan } from '../subscription/const/subscription-plan.enum';
import { PlanAmount } from '../subscription/const/plan-amount.enum';

@Injectable()
export class OrderService {
  constructor(
    @Inject(IORDER_DOMAIN_SERVICE)
    private readonly orderDomainService: IOrderDomainService,
  ) {}

  async createSampleOrders(user: UserModel) {
    for (let i = 0; i < 50; i++) {
      const plan = i === 45 ? SubscriptionPlan.PLUS : SubscriptionPlan.STANDARD;
      const amount = PlanAmount[plan];

      await this.orderDomainService.createOrder(user, plan, amount, true);
    }
  }

  async getOrders(user: UserModel, dto: GetOrdersDto) {
    const orders = await this.orderDomainService.findOrderList(user, dto);

    return new GetOrdersPaginationResponseDto(
      orders.items,
      orders.items.length,
      orders.nextCursor,
      orders.hasMore,
    );
  }

  async deleteOrder(user: UserModel, orderId: number, qr?: QueryRunner) {
    const targetOrder = await this.orderDomainService.findOrderModelById(
      user,
      orderId,
      qr,
    );

    await this.orderDomainService.deleteOrder(targetOrder, qr);

    return new DeleteOrderResponseDto(new Date(), targetOrder.id, true);
  }
}
