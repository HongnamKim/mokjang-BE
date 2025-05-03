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

@ApiTags('Tasks')
@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  getTasks(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetTasksDto,
  ) {
    return this.taskService.getTasks(churchId, dto);
  }

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

  @Get(':taskId')
  async getTaskById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
  ) {
    return this.taskService.getTaskById(churchId, taskId);
  }

  @Patch(':taskId')
  patchTask(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
  ) {}

  @Delete(':taskId')
  deleteTask(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
  ) {}
}
