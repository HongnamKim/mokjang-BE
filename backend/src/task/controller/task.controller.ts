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
  ApiGetSubTasks,
  ApiGetTaskById,
  ApiGetTasks,
  ApiPatchTask,
  ApiPostTask,
} from '../const/swagger/task.swagger';
import { AddTaskReportReceiverDto } from '../../report/dto/task-report/request/add-task-report-receiver.dto';
import { DeleteTaskReportReceiverDto } from '../../report/dto/task-report/request/delete-task-report-receiver.dto';
import { TaskGuard } from '../guard/task.guard';
import { DomainAction } from '../../permission/const/domain-action.enum';
import { createDomainGuard } from '../../permission/guard/generic-domain.guard';
import { DomainType } from '../../permission/const/domain-type.enum';

@ApiTags('Tasks')
@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @ApiGetTasks()
  @UseGuards(
    AccessTokenGuard,
    createDomainGuard(DomainType.TASK, '업무', DomainAction.READ),
  )
  @Get()
  getTasks(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetTasksDto,
  ) {
    return this.taskService.getTasks(churchId, dto);
  }

  @ApiPostTask()
  @UseGuards(AccessTokenGuard, TaskGuard(DomainAction.WRITE))
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
  @UseGuards(AccessTokenGuard, TaskGuard(DomainAction.READ))
  @Get(':taskId')
  async getTaskById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
  ) {
    return this.taskService.getTaskById(churchId, taskId);
  }

  @ApiGetSubTasks()
  @UseGuards(AccessTokenGuard, TaskGuard(DomainAction.READ))
  @Get(':taskId/sub-tasks')
  async getSubTasks(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
  ) {
    return this.taskService.getSubTasks(churchId, taskId);
  }

  @ApiPatchTask()
  @UseGuards(AccessTokenGuard, TaskGuard(DomainAction.WRITE))
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
  @UseGuards(AccessTokenGuard, TaskGuard(DomainAction.WRITE))
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
  @UseGuards(AccessTokenGuard, TaskGuard(DomainAction.WRITE))
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
  @UseGuards(AccessTokenGuard, TaskGuard(DomainAction.WRITE))
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
