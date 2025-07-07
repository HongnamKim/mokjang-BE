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
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { AuthType } from '../../auth/const/enum/auth-type.enum';
import { Token } from '../../auth/decorator/jwt.decorator';
import { JwtAccessPayload } from '../../auth/type/jwt';

@ApiTags('MyPage:Reports:Tasks')
@Controller('tasks')
export class TaskReportController {
  constructor(private readonly taskReportService: TaskReportService) {}

  @ApiGetTaskReports()
  @Get()
  @UseGuards(AccessTokenGuard)
  getTaskReports(
    @Query() dto: GetTaskReportDto,
    @Token(AuthType.ACCESS) accessToken: JwtAccessPayload,
  ) {
    return this.taskReportService.getTaskReports(accessToken.id, dto);
  }

  @ApiGetTaskReportById()
  @Get(':taskReportId')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(TransactionInterceptor)
  getTaskReportById(
    @Token(AuthType.ACCESS) accessToken: JwtAccessPayload,
    @Param('taskReportId', ParseIntPipe) taskReportId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.taskReportService.getTaskReportById(
      accessToken.id,
      taskReportId,
      qr,
    );
  }

  @ApiPatchTaskReport()
  @UseGuards(AccessTokenGuard)
  @Patch(':taskReportId')
  patchTaskReport(
    @Token(AuthType.ACCESS) accessToken: JwtAccessPayload,
    @Param('taskReportId', ParseIntPipe) taskReportId: number,
    @Body() dto: UpdateTaskReportDto,
  ) {
    return this.taskReportService.patchTaskReport(
      accessToken.id,
      taskReportId,
      dto,
    );
  }

  @ApiDeleteTaskReport()
  @UseGuards(AccessTokenGuard)
  @Delete(':taskReportId')
  deleteTaskReport(
    @Token(AuthType.ACCESS) accessToken: JwtAccessPayload,
    @Param('taskReportId', ParseIntPipe) taskReportId: number,
  ) {
    return this.taskReportService.deleteTaskReport(
      accessToken.id,
      taskReportId,
    );
  }
}
