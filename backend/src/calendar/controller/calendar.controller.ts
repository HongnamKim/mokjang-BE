import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { GetBirthdayMembersDto } from '../dto/get-birthday-members.dto';
import { CalendarService } from '../service/calendar.service';

@Controller()
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

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
