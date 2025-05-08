import { Controller, Delete, Get, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Churches:Members:Reports:Tasks')
@Controller('tasks')
export class TaskReportController {
  constructor() {}

  @Get()
  getTaskReports() {}

  @Get(':taskReportId')
  getTaskReportById() {}

  @Patch(':taskReportId')
  patchTaskReport() {}

  @Delete(':taskReportId')
  deleteTaskReport() {}
}
