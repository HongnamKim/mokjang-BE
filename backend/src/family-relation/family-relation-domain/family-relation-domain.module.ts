import { Module } from '@nestjs/common';
import { IFAMILY_RELATION_DOMAIN_SERVICE } from './service/interface/family-relation-domain.service.interface';
import { FamilyRelationDomainService } from './service/family-relation-domain.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamilyRelationModel } from '../entity/family-relation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FamilyRelationModel])],
  providers: [
    {
      provide: IFAMILY_RELATION_DOMAIN_SERVICE,
      useClass: FamilyRelationDomainService,
    },
  ],
  exports: [IFAMILY_RELATION_DOMAIN_SERVICE],
})
export class FamilyRelationDomainModule {}
