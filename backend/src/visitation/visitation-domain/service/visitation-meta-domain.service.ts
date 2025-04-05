import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IVisitationMetaDomainService } from './interface/visitation-meta-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { VisitationMetaModel } from '../../entity/visitation-meta.entity';
import { QueryRunner, Repository } from 'typeorm';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { CreateVisitationMetaDto } from '../../dto/meta/create-visitation-meta.dto';
import { MemberModel } from '../../../members/entity/member.entity';
import { VisitationMetaException } from '../../const/exception/visitation-meta.exception';
import { UpdateVisitationMetaDto } from '../../dto/meta/update-visitation-meta.dto';

@Injectable()
export class VisitationMetaDomainService
  implements IVisitationMetaDomainService
{
  constructor(
    @InjectRepository(VisitationMetaModel)
    private readonly visitationMetaRepository: Repository<VisitationMetaModel>,
  ) {}

  private getVisitationMetaRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(VisitationMetaModel)
      : this.visitationMetaRepository;
  }

  async paginateVisitations(
    church: ChurchModel,
  ): Promise<{ visitations: VisitationMetaModel[]; totalCount: number }> {
    const repository = this.getVisitationMetaRepository();

    const [visitations, totalCount] = await Promise.all([
      repository.find({
        where: {
          churchId: church.id,
        },
        relations: {
          visitationDetails: {
            member: true,
          },
        },
      }),
      repository.count({
        where: {
          churchId: church.id,
        },
      }),
    ]);

    return { visitations, totalCount };
  }

  async findVisitationMetaById(
    church: ChurchModel,
    visitationMetaId: number,
    qr?: QueryRunner,
  ) {
    const repository = this.getVisitationMetaRepository(qr);

    const visitation = await repository.findOne({
      where: {
        churchId: church.id,
        id: visitationMetaId,
      },
      relations: {
        instructor: true,
      },
    });

    if (!visitation) {
      throw new NotFoundException(VisitationMetaException.NOT_FOUND);
    }

    return visitation;
  }

  async findVisitationMetaModelById(
    church: ChurchModel,
    visitationMetaId: number,
    qr?: QueryRunner,
  ): Promise<VisitationMetaModel> {
    const repository = this.getVisitationMetaRepository(qr);

    const metaData = await repository.findOne({
      where: {
        id: visitationMetaId,
        churchId: church.id,
      },
    });

    if (!metaData) {
      throw new NotFoundException(VisitationMetaException.NOT_FOUND);
    }

    return metaData;
  }

  async createVisitationMetaData(
    church: ChurchModel,
    instructor: MemberModel,
    dto: CreateVisitationMetaDto,
    qr: QueryRunner,
    reportTo?: MemberModel,
  ) {
    const visitationMetaRepository = this.getVisitationMetaRepository(qr);

    return visitationMetaRepository.save({
      churchId: church.id,
      instructor,
      visitationStatus: dto.visitationStatus,
      visitationMethod: dto.visitationMethod,
      visitationType: dto.visitationType,
      visitationTitle: dto.visitationTitle,
      visitationDate: dto.visitationDate,
    });
  }

  async updateVisitationMetaData(
    visitationMetaData: VisitationMetaModel,
    dto: UpdateVisitationMetaDto,
    qr?: QueryRunner,
  ): Promise<VisitationMetaModel> {
    const visitationMetaRepository = this.getVisitationMetaRepository(qr);

    const result = await visitationMetaRepository.update(
      {
        id: visitationMetaData.id,
      },
      {
        ...dto,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException();
    }

    const meta = await this.visitationMetaRepository.findOne({
      where: {
        id: visitationMetaData.id,
      },
    });

    if (!meta) {
      throw new InternalServerErrorException(
        VisitationMetaException.UPDATE_ERROR,
      );
    }

    return meta;
  }
}
