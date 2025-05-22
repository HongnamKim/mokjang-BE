import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TaskService } from '../service/task.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateTaskDto } from '../dto/request/create-task.dto';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { ChurchManagerGuard } from '../../churches/guard/church-guard.service';
import { Token } from '../../auth/decorator/jwt.decorator';
import { JwtAccessPayload } from '../../auth/type/jwt';
import { AuthType } from '../../auth/const/enum/auth-type.enum';
import { GetTasksDto } from '../dto/request/get-tasks.dto';
import { UpdateTaskDto } from '../dto/request/update-task.dto';
import {
  ApiAddReportReceivers,
  ApiDeleteReportReceiver,
  ApiDeleteTask,
  ApiGetTaskById,
  ApiGetTasks,
  ApiPatchTask,
  ApiPostTask,
} from '../const/swagger/task.swagger';
import { AddTaskReportReceiverDto } from '../../report/dto/task-report/request/add-task-report-receiver.dto';
import { DeleteTaskReportReceiverDto } from '../../report/dto/task-report/request/delete-task-report-receiver.dto';

@ApiTags('Tasks')
@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @ApiGetTasks()
  @Get()
  getTasks(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetTasksDto,
  ) {
    return this.taskService.getTasks(churchId, dto);
  }

  @ApiPostTask()
  @Post()
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  @UseInterceptors(TransactionInterceptor)
  postTask(
    @Token(AuthType.ACCESS) accessPayload: JwtAccessPayload,
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateTaskDto,
    @QueryRunner() qr: QR,
  ) {
    return this.taskService.postTask(churchId, accessPayload.id, dto, qr);
  }

  @ApiGetTaskById()
  @Get(':taskId')
  async getTaskById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
  ) {
    return this.taskService.getTaskById(churchId, taskId);
  }

  @ApiPatchTask()
  @Patch(':taskId')
  @UseInterceptors(TransactionInterceptor)
  patchTask(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() dto: UpdateTaskDto,
    @QueryRunner() qr: QR,
  ) {
    return this.taskService.patchTask(churchId, taskId, dto, qr);
  }

  @ApiDeleteTask()
  @Delete(':taskId')
  @UseInterceptors(TransactionInterceptor)
  deleteTask(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.taskService.deleteTask(churchId, taskId, qr);
  }

  @ApiAddReportReceivers()
  @Patch(':taskId/add-receivers')
  @UseInterceptors(TransactionInterceptor)
  addReportReceivers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() dto: AddTaskReportReceiverDto,
    @QueryRunner() qr: QR,
  ) {
    return this.taskService.addTaskReportReceivers(churchId, taskId, dto, qr);
  }

  @ApiDeleteReportReceiver()
  @Patch(':taskId/delete-receivers')
  @UseInterceptors(TransactionInterceptor)
  deleteReportReceivers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() dto: DeleteTaskReportReceiverDto,
    @QueryRunner() qr: QR,
  ) {
    return this.taskService.deleteTaskReportReceivers(
      churchId,
      taskId,
      dto,
      qr,
    );
  }
}
