import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IOrderDomainService } from '../interface/order-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderModel } from '../../entity/order.entity';
import {
  QueryRunner,
  Repository,
  SelectQueryBuilder,
  UpdateResult,
} from 'typeorm';
import { UserModel } from '../../../user/entity/user.entity';
import { GetOrdersDto } from '../../dto/request/get-orders.dto';
import { OrderSortColumn } from '../../const/order-order.enum';
import { v4 as uuidv4 } from 'uuid';
import { OrderException } from '../../exception/order.exception';

@Injectable()
export class OrderDomainService implements IOrderDomainService {
  constructor(
    @InjectRepository(OrderModel)
    private readonly repository: Repository<OrderModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(OrderModel) : this.repository;
  }

  async findOrderList(user: UserModel, dto: GetOrdersDto) {
    const repository = this.getRepository();

    const query = repository
      .createQueryBuilder('order')
      .leftJoin('order.user', 'user')
      .where('user.id = :userId', { userId: user.id });

    if (dto.cursor) {
      this.applyCursorPagination(
        query,
        dto.cursor,
        dto.sortBy,
        dto.sortDirection,
      );
    }

    const items = await query.limit(dto.limit + 1).getMany();
    console.log(query.getQuery());

    const hasMore = items.length > dto.limit;
    if (hasMore) {
      items.pop();
    }

    const nextCursor =
      hasMore && items.length > 0
        ? this.encodeCursor(items[items.length - 1], dto.sortBy)
        : undefined;

    return {
      items,
      nextCursor,
      hasMore,
    };
  }

  async findOrderModelById(
    user: UserModel,
    orderId: number,
    qr?: QueryRunner,
  ): Promise<OrderModel> {
    const repository = this.getRepository(qr);

    const order = await repository.findOne({
      where: {
        userId: user.id,
        id: orderId,
      },
    });

    if (!order) {
      throw new NotFoundException(OrderException.NOT_FOUND);
    }

    return order;
  }

  createOrder(
    user: UserModel,
    goodsName: string,
    amount: number,
    success: boolean,
    qr?: QueryRunner,
  ): Promise<OrderModel> {
    const repository = this.getRepository(qr);

    return repository.save({
      userId: user.id,
      orderId: uuidv4(),
      goodsName,
      amount,
      orderedAt: new Date(),
      success,
    });
  }

  async deleteOrder(
    order: OrderModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    const result = await repository.softDelete({ id: order.id });

    if (result.affected === 0) {
      throw new InternalServerErrorException(OrderException.DELETE_ERROR);
    }

    return result;
  }

  private applySort(
    query: SelectQueryBuilder<OrderModel>,
    sortBy: OrderSortColumn,
    sortDirection: 'ASC' | 'DESC',
  ) {
    const sortColumn = this.getSortColumnPath(sortBy);

    switch (sortBy) {
      default:
        query.orderBy(`${sortColumn}`, sortDirection);
        break;
    }

    query.addOrderBy('order.id', sortDirection);
  }

  private getSortColumnPath(sortBy: OrderSortColumn) {
    switch (sortBy) {
      case OrderSortColumn.CREATED_AT:
        return 'order.createdAt';
      case OrderSortColumn.ORDERED_AT:
        return 'order.orderedAt';
    }
  }

  private applyCursorPagination(
    query: SelectQueryBuilder<OrderModel>,
    cursor: string,
    sortBy: OrderSortColumn,
    sortDirection: 'ASC' | 'DESC',
  ) {
    const decodedCursor = this.decodeCursor(cursor);

    if (!decodedCursor) return;

    if (decodedCursor.column !== sortBy) return;

    const { id, value } = decodedCursor;

    const column = this.getSortColumnPath(sortBy);

    if (sortDirection === 'ASC') {
      query.andWhere(
        `(${column} > :value OR (${column} = :value AND order.id > :id))`,
        { value, id },
      );
    } else {
      query.andWhere(
        //'order.id = :id',
        `(${column} < :value OR (${column} = :value AND order.id < :id))`,
        { value, id },
      );
    }
  }

  private encodeCursor(order: OrderModel, sortBy: OrderSortColumn) {
    let value: any;

    switch (sortBy) {
      case OrderSortColumn.CREATED_AT:
        value = order.createdAt;
        break;
      case OrderSortColumn.ORDERED_AT:
        value = order.orderedAt;
        break;
    }

    const cursorData = {
      id: order.id,
      value,
      column: sortBy,
    };

    return Buffer.from(JSON.stringify(cursorData)).toString('base64');
  }

  private decodeCursor(cursor: string) {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }
}
