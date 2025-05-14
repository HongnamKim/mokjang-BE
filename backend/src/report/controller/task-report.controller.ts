import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetTaskReportDto } from '../dto/task-report/get-task-report.dto';
import { TaskReportService } from '../service/task-report.service';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { UpdateTaskReportDto } from '../dto/task-report/request/update-task-report.dto';
import {
  ApiDeleteTaskReport,
  ApiGetTaskReportById,
  ApiGetTaskReports,
  ApiPatchTaskReport,
} from '../const/swagger/task-report.swagger';

@ApiTags('Churches:Members:Reports:Tasks')
@Controller('tasks')
export class TaskReportController {
  constructor(private readonly taskReportService: TaskReportService) {}

  @ApiGetTaskReports()
  @Get()
  getTaskReports(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Query() dto: GetTaskReportDto,
  ) {
    return this.taskReportService.getTaskReports(churchId, memberId, dto);
  }

  @ApiGetTaskReportById()
  @Get(':taskReportId')
  @UseInterceptors(TransactionInterceptor)
  getTaskReportById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('taskReportId', ParseIntPipe) taskReportId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.taskReportService.getTaskReportById(
      churchId,
      memberId,
      taskReportId,
      qr,
    );
  }

  @ApiPatchTaskReport()
  @Patch(':taskReportId')
  patchTaskReport(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('taskReportId', ParseIntPipe) taskReportId: number,
    @Body() dto: UpdateTaskReportDto,
  ) {
    return this.taskReportService.patchTaskReport(
      churchId,
      memberId,
      taskReportId,
      dto,
    );
  }

  @ApiDeleteTaskReport()
  @Delete(':taskReportId')
  deleteTaskReport(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('taskReportId', ParseIntPipe) taskReportId: number,
  ) {
    return this.taskReportService.deleteTaskReport(
      churchId,
      memberId,
      taskReportId,
    );
  }
}
