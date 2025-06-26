import { Module } from '@nestjs/common';
import { IPERMISSION_DOMAIN_SERVICE } from './service/interface/permission-domain.service.interface';
import { PermissionDomainService } from './service/permission-domain.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionUnitModel } from '../entity/permission-unit.entity';
import { PermissionUnitSeederService } from './service/permission-unit-seeder.service';
import { PermissionTemplateModel } from '../entity/permission-template.entity';
import { PermissionScopeModel } from '../entity/permission-scope.entity';
import { IPERMISSION_SCOPE_DOMAIN_SERVICE } from './service/interface/permission-scope-domain.service.interface';
import { PermissionScopeDomainService } from './service/permission-scope-domain.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PermissionUnitModel,
      PermissionTemplateModel,
      PermissionScopeModel,
    ]),
  ],
  providers: [
    PermissionUnitSeederService,
    { provide: IPERMISSION_DOMAIN_SERVICE, useClass: PermissionDomainService },
    {
      provide: IPERMISSION_SCOPE_DOMAIN_SERVICE,
      useClass: PermissionScopeDomainService,
    },
  ],
  exports: [
    PermissionUnitSeederService,
    IPERMISSION_DOMAIN_SERVICE,
    IPERMISSION_SCOPE_DOMAIN_SERVICE,
  ],
})
export class PermissionDomainModule {}
