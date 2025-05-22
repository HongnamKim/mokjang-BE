import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IVISITATION_DETAIL_DOMAIN_SERVICE,
  IVisitationDetailDomainService,
} from '../visitation-domain/interface/visitation-detail-domain.service.interface';
import { VisitationMetaModel } from '../entity/visitation-meta.entity';
import { MemberModel } from '../../members/entity/member.entity';
import { CreateVisitationDto } from '../dto/create-visitation.dto';
import { QueryRunner } from 'typeorm';
import { MemberException } from '../../members/const/exception/member.exception';
import { VisitationDetailDto } from '../dto/visittion-detail.dto';

@Injectable()
export class VisitationDetailService {
  constructor(
    @Inject(IVISITATION_DETAIL_DOMAIN_SERVICE)
    private readonly visitationDetailDomainService: IVisitationDetailDomainService,
  ) {}

  createVisitationDetails(
    visitationMeta: VisitationMetaModel,
    members: MemberModel[],
    dto: CreateVisitationDto,
    qr: QueryRunner,
  ) {
    return Promise.all(
      dto.visitationDetails.map(
        async (visitationDetailDto: VisitationDetailDto) => {
          const visitationMember = members.find(
            (member) => member.id === visitationDetailDto.memberId,
          );

          if (!visitationMember) {
            throw new NotFoundException(MemberException.NOT_FOUND);
          }

          return this.visitationDetailDomainService.createVisitationDetail(
            visitationMeta,
            visitationMember,
            visitationDetailDto,
            qr,
          );
        },
      ),
    );
  }
}
