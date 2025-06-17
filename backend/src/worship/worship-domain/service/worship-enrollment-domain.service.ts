import { Injectable } from '@nestjs/common';
import { IWorshipEnrollmentDomainService } from '../interface/worship-enrollment-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { WorshipEnrollmentModel } from '../../entity/worship-enrollment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WorshipEnrollmentDomainService
  implements IWorshipEnrollmentDomainService
{
  constructor(
    @InjectRepository(WorshipEnrollmentModel)
    private readonly repository: Repository<WorshipEnrollmentModel>,
  ) {}
}
