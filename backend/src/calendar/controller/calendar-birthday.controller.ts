import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { GetBirthdayMembersDto } from '../dto/request/birthday/get-birthday-members.dto';
import { CalendarBirthdayService } from '../service/calendar-birthday.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Calendar:Birthday')
@Controller()
export class CalendarBirthdayController {
  constructor(private readonly calendarService: CalendarBirthdayService) {}

  @Get('birthday')
  getBirthdayMembers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetBirthdayMembersDto,
  ) {
    return this.calendarService.getBirthdayMembers(churchId, dto);
  }

  @Post('birthday-migration')
  migrationBirthdayMMDD(@Param('churchId', ParseIntPipe) churchId: number) {
    return this.calendarService.migrationBirthdayMMDD(churchId);
  }
}
