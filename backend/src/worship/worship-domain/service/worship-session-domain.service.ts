import { Injectable } from '@nestjs/common';
import { IWorshipSessionDomainService } from '../interface/worship-session-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { WorshipSessionModel } from '../../entity/worship-session.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WorshipSessionDomainService
  implements IWorshipSessionDomainService
{
  constructor(
    @InjectRepository(WorshipSessionModel)
    private readonly repository: Repository<WorshipSessionModel>,
  ) {}
}
