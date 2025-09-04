import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { ChurchUserGuard } from '../../church-user/guard/church-user.guard';
import { RequestChurchUser } from '../../common/decorator/request-church-user.decorator';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { NotificationService } from '../service/notification.service';
import { GetNotificationsDto } from '../dto/request/get-notifications.dto';
import {
  ApiGetNotifications,
  ApiGetUnreadCount,
  ApiPatchCheckAllRead,
  ApiPatchCheckRead,
} from '../swagger/notification.swagger';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiGetNotifications()
  @Get()
  @UseGuards(AccessTokenGuard, ChurchUserGuard)
  getNotifications(
    @RequestChurchUser() churchUser: ChurchUserModel,
    @Query() dto: GetNotificationsDto,
  ) {
    return this.notificationService.getNotifications(churchUser, dto);
  }

  @ApiGetUnreadCount()
  @Get('unread')
  @UseGuards(AccessTokenGuard, ChurchUserGuard)
  getUnreadCount(@RequestChurchUser() churchUser: ChurchUserModel) {
    return this.notificationService.getUnreadCount(churchUser);
  }

  @Post('test')
  @UseGuards(AccessTokenGuard, ChurchUserGuard)
  createDummyNotification(@RequestChurchUser() churchUser: ChurchUserModel) {
    return this.notificationService.createDummyNotification(churchUser);
  }

  @ApiPatchCheckAllRead()
  @Patch('read-all')
  @UseGuards(AccessTokenGuard, ChurchUserGuard)
  checkReadAll(@RequestChurchUser() churchUser: ChurchUserModel) {
    return this.notificationService.checkReadAll(churchUser);
  }

  @ApiPatchCheckRead()
  @Patch(':notificationId/read')
  @UseGuards(AccessTokenGuard, ChurchUserGuard)
  checkRead(
    @RequestChurchUser() churchUser: ChurchUserModel,
    @Param('notificationId', ParseIntPipe) notificationId: number,
  ) {
    return this.notificationService.checkRead(churchUser, notificationId);
  }

  @Delete('test-cleanup')
  testCleanUp() {
    return this.notificationService.cleanUp();
  }
}
