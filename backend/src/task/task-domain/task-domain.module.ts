import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskModel } from '../entity/task.entity';
import { ITASK_DOMAIN_SERVICE } from './interface/task-domain.service.interface';
import { TaskDomainService } from './service/task-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([TaskModel])],
  providers: [
    {
      provide: ITASK_DOMAIN_SERVICE,
      useClass: TaskDomainService,
    },
  ],
  exports: [ITASK_DOMAIN_SERVICE],
})
export class TaskDomainModule {}
