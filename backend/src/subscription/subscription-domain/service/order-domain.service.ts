import { Injectable } from '@nestjs/common';
import { IOrderDomainService } from '../interface/order-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderModel } from '../../entity/order.entity';
import { QueryRunner, Repository } from 'typeorm';

@Injectable()
export class OrderDomainService implements IOrderDomainService {
  constructor(
    @InjectRepository(OrderModel)
    private readonly repository: Repository<OrderModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(OrderModel) : this.repository;
  }

  createOrder() {}
}
