import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionUnitModel } from '../../entity/permission-unit.entity';
import { Repository } from 'typeorm';
import { DomainType } from '../../const/domain-type.enum';
import { DomainAction } from '../../const/domain-action.enum';

@Injectable()
export class PermissionUnitSeederService {
  constructor(
    @InjectRepository(PermissionUnitModel)
    private readonly unitRepo: Repository<PermissionUnitModel>,
  ) {}

  private readonly logger = new Logger(PermissionUnitSeederService.name);

  async seed() {
    const domains = Object.values(DomainType);
    const actions = Object.values(DomainAction);

    let existCount = 0;
    let createCount = 0;

    const existingUnits = await this.unitRepo.find();
    const existingMap = new Set(
      existingUnits.map((u) => `${u.domain}:${u.action}`),
    );

    for (const domain of domains) {
      for (const action of actions) {
        const key = `${domain}:${action}`;
        if (!existingMap.has(key)) {
          createCount++;
          const unit = this.unitRepo.create({ domain, action });
          await this.unitRepo.save(unit);
        } else {
          existCount++;
        }
      }
    }

    this.logger.log(
      `[PermissionUnit] Seed complete Created: ${createCount}, Exists: ${existCount}`,
    );
  }
}
