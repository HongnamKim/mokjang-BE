import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from '../auth/guard/jwt.guard';
import { UserGuard } from '../user/guard/user.guard';
import { User } from '../user/decorator/user.decorator';
import { UserModel } from '../user/entity/user.entity';
import { GetOrdersDto } from './dto/request/get-orders.dto';
import { OrderService } from './order.service';

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @UseGuards(AccessTokenGuard, UserGuard)
  getOrders(@User() user: UserModel, @Query() dto: GetOrdersDto) {
    return this.orderService.getOrders(user, dto);
  }

  @Post('sample')
  @UseGuards(AccessTokenGuard, UserGuard)
  createSampleOrders(@User() user: UserModel) {
    return this.orderService.createSampleOrders(user);
  }

  @Delete(':orderId')
  @UseGuards(AccessTokenGuard, UserGuard)
  deleteOrder(@User() user: UserModel, @Param('orderId') orderId: number) {}
}
