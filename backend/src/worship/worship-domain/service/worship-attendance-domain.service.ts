import { Injectable } from '@nestjs/common';
import { IWorshipAttendanceDomainService } from '../interface/worship-attendance-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { WorshipAttendanceModel } from '../../entity/worship-attendance.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WorshipAttendanceDomainService
  implements IWorshipAttendanceDomainService
{
  constructor(
    @InjectRepository(WorshipAttendanceModel)
    private readonly repository: Repository<WorshipAttendanceModel>,
  ) {}
}
