import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetEducationHistoryDto } from '../dto/education/get-education-history.dto';
import { EducationHistoryService } from '../service/education-history.service';
import { ApiGetEducationHistory } from '../swagger/education-history.swagger';
import { HistoryReadGuard } from '../guard/history-read.guard';

@ApiTags('Churches:Members:Educations')
@Controller('educations')
export class EducationHistoryController {
  constructor(
    private readonly educationHistoryService: EducationHistoryService,
  ) {}

  @ApiGetEducationHistory()
  @Get()
  @HistoryReadGuard()
  getMemberEducationHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Query() dto: GetEducationHistoryDto,
  ) {
    return this.educationHistoryService.getMemberEducationEnrollments(
      churchId,
      memberId,
      dto,
    );
  }
}
