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
  UseInterceptors,
} from '@nestjs/common';
import { TaskService } from '../service/task.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateTaskDto } from '../dto/request/create-task.dto';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
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
  ApiRefreshTaskCount,
} from '../const/swagger/task.swagger';
import { AddTaskReportReceiverDto } from '../../report/task-report/dto/request/add-task-report-receiver.dto';
import { DeleteTaskReportReceiverDto } from '../../report/task-report/dto/request/delete-task-report-receiver.dto';
import { TaskReadGuard } from '../guard/task-read.guard';
import { TaskWriteGuard } from '../guard/task-write.guard';
import { RequestManager } from '../../permission/decorator/permission-manager.decorator';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { RequestChurch } from '../../permission/decorator/permission-church.decorator';
import { ChurchModel } from '../../churches/entity/church.entity';

@ApiTags('Tasks')
@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @ApiGetTasks()
  @TaskReadGuard()
  @Get()
  getTasks(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetTasksDto,
  ) {
    return this.taskService.getTasks(churchId, dto);
  }

  @ApiPostTask()
  @TaskWriteGuard()
  @Post()
  @UseInterceptors(TransactionInterceptor)
  postTask(
    @RequestManager() manager: ChurchUserModel,
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateTaskDto,
    @QueryRunner() qr: QR,
  ) {
    return this.taskService.postTask(churchId, manager, dto, qr);
  }

  @ApiRefreshTaskCount()
  @TaskWriteGuard()
  @Patch('refresh-count')
  @UseInterceptors(TransactionInterceptor)
  refreshTaskCount(
    @RequestChurch() church: ChurchModel,
    @QueryRunner() qr: QR,
  ) {
    return this.taskService.refreshTaskCount(church, qr);
  }

  @ApiGetTaskById()
  @TaskReadGuard()
  @Get(':taskId')
  async getTaskById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
  ) {
    return this.taskService.getTaskById(churchId, taskId);
  }

  @ApiGetSubTasks()
  @TaskReadGuard()
  @Get(':taskId/sub-tasks')
  async getSubTasks(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
  ) {
    return this.taskService.getSubTasks(churchId, taskId);
  }

  @ApiPatchTask()
  @TaskWriteGuard()
  @Patch(':taskId')
  @UseInterceptors(TransactionInterceptor)
  patchTask(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
    @RequestManager() requestManager: ChurchUserModel,
    @Body() dto: UpdateTaskDto,
    @QueryRunner() qr: QR,
  ) {
    return this.taskService.patchTask(
      requestManager,
      churchId,
      taskId,
      dto,
      qr,
    );
  }

  @ApiDeleteTask()
  @TaskWriteGuard()
  @Delete(':taskId')
  @UseInterceptors(TransactionInterceptor)
  deleteTask(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
    @RequestManager() requestManager: ChurchUserModel,
    @QueryRunner() qr: QR,
  ) {
    return this.taskService.deleteTask(requestManager, churchId, taskId, qr);
  }

  @ApiAddReportReceivers()
  @TaskWriteGuard()
  @Patch(':taskId/add-receivers')
  @UseInterceptors(TransactionInterceptor)
  addReportReceivers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
    @RequestManager() requestManager: ChurchUserModel,
    @Body() dto: AddTaskReportReceiverDto,
    @QueryRunner() qr: QR,
  ) {
    return this.taskService.addTaskReportReceivers(
      churchId,
      taskId,
      requestManager,
      dto,
      qr,
    );
  }

  @ApiDeleteReportReceiver()
  @TaskWriteGuard()
  @Patch(':taskId/delete-receivers')
  @UseInterceptors(TransactionInterceptor)
  deleteReportReceivers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
    @RequestManager() requestManager: ChurchUserModel,
    @Body() dto: DeleteTaskReportReceiverDto,
    @QueryRunner() qr: QR,
  ) {
    return this.taskService.deleteTaskReportReceivers(
      churchId,
      taskId,
      requestManager,
      dto,
      qr,
    );
  }
}
