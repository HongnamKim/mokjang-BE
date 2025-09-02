import { GetOrdersDto } from '../../dto/request/get-orders.dto';
import { UserModel } from '../../../user/entity/user.entity';
import { DomainCursorPaginationResultDto } from '../../../common/dto/domain-cursor-pagination-result.dto';
import { OrderModel } from '../../entity/order.entity';
import { QueryRunner, UpdateResult } from 'typeorm';

export const IORDER_DOMAIN_SERVICE = Symbol('IORDER_DOMAIN_SERVICE');

export interface IOrderDomainService {
  findOrderList(
    user: UserModel,
    dto: GetOrdersDto,
  ): Promise<DomainCursorPaginationResultDto<OrderModel>>;

  findOrderModelById(
    user: UserModel,
    orderId: number,
    qr?: QueryRunner,
  ): Promise<OrderModel>;

  createOrder(
    user: UserModel,
    goodsName: string,
    amount: number,
    success: boolean,
    qr?: QueryRunner,
  ): Promise<OrderModel>;

  deleteOrder(order: OrderModel, qr?: QueryRunner): Promise<UpdateResult>;
}
