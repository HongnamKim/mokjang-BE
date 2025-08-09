import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { MembersDomainModule } from '../members/member-domain/members-domain.module';
import { TaskController } from './controller/task.controller';
import { TaskService } from './service/task.service';
import { TaskDomainModule } from './task-domain/task-domain.module';
import { TaskReportDomainModule } from '../report/task-report/task-report-domain/task-report-domain.module';
import { ManagerDomainModule } from '../manager/manager-domain/manager-domain.module';
import { TaskPermissionService } from './service/task-permission.service';
import { IDOMAIN_PERMISSION_SERVICE } from '../permission/service/domain-permission.service.interface';

@Module({
  imports: [
    RouterModule.register([
      { path: 'churches/:churchId/tasks', module: TaskModule },
    ]),
    ChurchesDomainModule,
    ManagerDomainModule,
    MembersDomainModule,
    TaskDomainModule,

    TaskReportDomainModule,
  ],
  controllers: [TaskController],
  providers: [
    TaskService,
    {
      provide: IDOMAIN_PERMISSION_SERVICE,
      useClass: TaskPermissionService,
    },
  ],
})
export class TaskModule {}
