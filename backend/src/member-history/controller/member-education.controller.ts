import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetEducationHistoryDto } from '../dto/education/get-education-history.dto';
import { MemberEducationService } from '../service/member-education.service';
import { ApiGetEducationHistory } from '../const/swagger/education/controller.swagger';

@ApiTags('Churches:Members:Educations')
@Controller('educations')
export class MemberEducationController {
  constructor(
    private readonly educationHistoryService: MemberEducationService,
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
