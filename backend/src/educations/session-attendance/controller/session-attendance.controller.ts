import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { QueryRunner as QR } from 'typeorm';
import { GetAttendanceDto } from '../dto/request/get-attendance.dto';
import { ApiGetSessionAttendance } from '../swagger/session-attendance.swagger';
import { SessionAttendanceService } from '../service/session-attendance.service';
import { EducationReadGuard } from '../../guard/education-read.guard';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import { UpdateAttendancePresentDto } from '../dto/request/update-attendance-present.dto';
import { UpdateAttendanceNoteDto } from '../dto/request/update-attendance-note.dto';
import { RequestChurch } from '../../../permission/decorator/request-church.decorator';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { RequestManager } from '../../../permission/decorator/request-manager.decorator';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';

@ApiTags('Educations:Attendance')
@Controller(
  'educations/:educationId/terms/:educationTermId/sessions/:sessionId/attendance',
)
export class SessionAttendanceController {
  constructor(
    private readonly sessionAttendanceService: SessionAttendanceService,
  ) {}

  @ApiGetSessionAttendance()
  @EducationReadGuard()
  @Get()
  getSessionAttendances(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @RequestChurch() church: ChurchModel,
    @RequestManager() requestManager: ChurchUserModel,
    @Query() dto: GetAttendanceDto,
  ) {
    return this.sessionAttendanceService.getSessionAttendance(
      church,
      requestManager,
      educationId,
      educationTermId,
      sessionId,
      dto,
    );
  }

  @ApiOperation({ summary: '일괄 출석' })
  @Patch('all-attended')
  @UseInterceptors(TransactionInterceptor)
  patchAllAttended(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @RequestChurch() church: ChurchModel,
    @QueryRunner() qr: QR,
  ) {
    return this.sessionAttendanceService.bulkAttendance(
      church,
      educationId,
      educationTermId,
      sessionId,
      qr,
    );
  }

  @ApiOperation({ summary: '출석 여부 개별 수정' })
  @Patch(':attendanceId/attendance')
  @UseInterceptors(TransactionInterceptor)
  patchAttendancePresent(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Param('attendanceId', ParseIntPipe) attendanceId: number,
    @RequestChurch() church: ChurchModel,
    @Body() dto: UpdateAttendancePresentDto,
    @QueryRunner() qr: QR,
  ) {
    return this.sessionAttendanceService.updateSessionAttendancePresent(
      church,
      educationId,
      educationTermId,
      sessionId,
      attendanceId,
      dto,
      qr,
    );
  }

  @ApiOperation({ summary: '출석 특이사항 수정' })
  @Patch(':attendanceId/note')
  patchAttendanceNote(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Param('attendanceId', ParseIntPipe) attendanceId: number,
    @RequestChurch() church: ChurchModel,
    @Body() dto: UpdateAttendanceNoteDto,
  ) {
    return this.sessionAttendanceService.updateSessionAttendanceNote(
      church,
      educationId,
      educationTermId,
      sessionId,
      attendanceId,
      dto,
    );
  }
}
