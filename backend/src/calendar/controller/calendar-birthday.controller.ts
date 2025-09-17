import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetBirthdayMembersDto } from '../dto/request/birthday/get-birthday-members.dto';
import { CalendarBirthdayService } from '../service/calendar-birthday.service';
import { ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { ChurchManagerGuard } from '../../permission/guard/church-manager.guard';
import { RequestChurch } from '../../permission/decorator/request-church.decorator';
import { ChurchModel } from '../../churches/entity/church.entity';

@ApiTags('Calendar:Birthday')
@Controller()
export class CalendarBirthdayController {
  constructor(private readonly calendarService: CalendarBirthdayService) {}

  @Get('birthday')
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getBirthdayMembers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @Query() dto: GetBirthdayMembersDto,
  ) {
    return this.calendarService.getBirthdayMembers(church, dto);
  }

  @Post('birthday-migration')
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  migrationBirthdayMMDD(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
  ) {
    return this.calendarService.migrationBirthdayMMDD(church);
  }
}
