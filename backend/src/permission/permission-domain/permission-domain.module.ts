import { Module } from '@nestjs/common';
import { IPERMISSION_DOMAIN_SERVICE } from './service/interface/permission-domain.service.interface';
import { PermissionDomainService } from './service/permission-domain.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionUnitModel } from '../entity/permission-unit.entity';
import { PermissionUnitSeederService } from './service/permission-unit-seeder.service';
import { PermissionTemplateModel } from '../entity/permission-template.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PermissionUnitModel, PermissionTemplateModel]),
  ],
  providers: [
    PermissionUnitSeederService,
    { provide: IPERMISSION_DOMAIN_SERVICE, useClass: PermissionDomainService },
  ],
  exports: [PermissionUnitSeederService, IPERMISSION_DOMAIN_SERVICE],
})
export class PermissionDomainModule {}
