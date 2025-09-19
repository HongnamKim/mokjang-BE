import { Injectable } from '@nestjs/common';
import { IDummyOfficerDomainService } from '../interface/dummy-officer-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { OfficerModel } from '../../../management/officers/entity/officer.entity';
import { QueryRunner, Repository } from 'typeorm';
import { ChurchModel } from '../../../churches/entity/church.entity';

@Injectable()
export class DummyOfficerDomainService implements IDummyOfficerDomainService {
  constructor(
    @InjectRepository(OfficerModel)
    private readonly repository: Repository<OfficerModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(OfficerModel) : this.repository;
  }

  async createDummyOfficers(church: ChurchModel, qr: QueryRunner) {
    const repository = this.getRepository(qr);

    const dummyOfficers = repository.create([
      {
        name: '목사',
        churchId: church.id,
        membersCount: 1,
        order: 1,
      },
      {
        name: '장로',
        churchId: church.id,
        membersCount: 2,
        order: 2,
      },
      { name: '권사', membersCount: 8, churchId: church.id, order: 3 },
      { name: '집사', membersCount: 20, churchId: church.id, order: 4 },
    ]);

    return repository.save(dummyOfficers);
  }

  async deleteDummyOfficersCascade(church: ChurchModel, qr: QueryRunner) {
    const repository = this.getRepository(qr);

    return repository.delete({ churchId: church.id });
  }
}
