import { Injectable } from '@nestjs/common';
import { IWorshipDomainService } from '../interface/worship-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { WorshipModel } from '../../entity/worship.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WorshipDomainService implements IWorshipDomainService {
  constructor(
    @InjectRepository(WorshipModel)
    private readonly repository: Repository<WorshipModel>,
  ) {}
}
