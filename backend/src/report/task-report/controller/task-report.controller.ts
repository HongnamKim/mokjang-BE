import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetTaskReportDto } from '../dto/get-task-report.dto';
import { TaskReportService } from '../service/task-report.service';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { UpdateTaskReportDto } from '../dto/request/update-task-report.dto';
import {
  ApiDeleteTaskReport,
  ApiGetTaskReportById,
  ApiGetTaskReports,
  ApiPatchTaskReport,
} from '../swagger/task-report.swagger';
import { AccessTokenGuard } from '../../../auth/guard/jwt.guard';
import { ChurchUserGuard } from '../../../church-user/guard/church-user.guard';
import { RequestChurchUser } from '../../../common/decorator/request-church-user.decorator';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';

@ApiTags('MyPage:Reports:Tasks')
@Controller('tasks')
export class TaskReportController {
  constructor(private readonly taskReportService: TaskReportService) {}

  @ApiGetTaskReports()
  @Get()
  @UseGuards(AccessTokenGuard, ChurchUserGuard)
  getTaskReports(
    @RequestChurchUser() churchUser: ChurchUserModel,
    @Query() dto: GetTaskReportDto,
  ) {
    return this.taskReportService.getTaskReports(churchUser, dto);
  }

  @ApiGetTaskReportById()
  @Get(':taskReportId')
  @UseGuards(AccessTokenGuard, ChurchUserGuard)
  @UseInterceptors(TransactionInterceptor)
  getTaskReportById(
    @RequestChurchUser() churchUser: ChurchUserModel,
    @Param('taskReportId', ParseIntPipe) taskReportId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.taskReportService.getTaskReportById(
      churchUser,
      taskReportId,
      qr,
    );
  }

  @ApiPatchTaskReport()
  @UseGuards(AccessTokenGuard, ChurchUserGuard)
  @Patch(':taskReportId')
  patchTaskReport(
    @RequestChurchUser() churchUser: ChurchUserModel,
    @Param('taskReportId', ParseIntPipe) taskReportId: number,
    @Body() dto: UpdateTaskReportDto,
  ) {
    return this.taskReportService.patchTaskReport(
      churchUser,
      taskReportId,
      dto,
    );
  }

  @ApiDeleteTaskReport()
  @UseGuards(AccessTokenGuard, ChurchUserGuard)
  @Delete(':taskReportId')
  deleteTaskReport(
    @RequestChurchUser() churchUser: ChurchUserModel,
    @Param('taskReportId', ParseIntPipe) taskReportId: number,
  ) {
    return this.taskReportService.deleteTaskReport(churchUser, taskReportId);
  }
}
