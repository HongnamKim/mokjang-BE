import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetEducationHistoryDto } from '../dto/education/get-education-history.dto';
import { EducationHistoryService } from '../service/education-history.service';
import { ApiGetEducationHistory } from '../const/swagger/education/controller.swagger';

@ApiTags('Churches:Members:Educations')
@Controller('educations')
export class EducationHistoryController {
  constructor(
    private readonly educationHistoryService: EducationHistoryService,
  ) {}

  @ApiGetEducationHistory()
  @Get()
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
