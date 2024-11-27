import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BelieverModel } from './entity/believer.entity';
import {
  FindOptionsRelations,
  FindOptionsWhere,
  ILike,
  IsNull,
  QueryRunner,
  Repository,
} from 'typeorm';
import { ChurchesService } from '../churches.service';
import { CreateBelieverDto } from './dto/create-believer.dto';
import { UpdateBelieverDto } from './dto/update-believer.dto';
import { GetBelieverDto } from './dto/get-believer.dto';
import { ResponsePaginationDto } from './dto/response/response-pagination.dto';
import { ResponseGetDto } from './dto/response/response-get.dto';

@Injectable()
export class BelieversService {
  constructor(
    @InjectRepository(BelieverModel)
    private readonly believersRepository: Repository<BelieverModel>,
    private readonly churchesService: ChurchesService,
  ) {}

  private getBelieversRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(BelieverModel)
      : this.believersRepository;
  }

  async getBelievers(churchId: number, dto: GetBelieverDto, qr?: QueryRunner) {
    const believersRepository = this.getBelieversRepository(qr);

    const findOptionsWhere: FindOptionsWhere<BelieverModel> = {
      churchId,
      name: dto.name ? ILike(`%${dto.name}%`) : undefined,
      //vehicleNumber: ArrayContains()
    };

    const totalCount = await believersRepository.count({
      where: findOptionsWhere,
    });

    const totalPage = Math.ceil(totalCount / dto.take);

    const result = await believersRepository.find({
      where: findOptionsWhere,
      take: dto.take,
      skip: dto.take * (dto.page - 1),
    });

    return new ResponsePaginationDto<BelieverModel>(
      result,
      result.length,
      dto.page,
      totalCount,
      totalPage,
    );
  }

  async getBelieversById(
    churchId: number,
    believerId: number,
    relations?: FindOptionsRelations<BelieverModel>,
    qr?: QueryRunner,
  ) {
    const believersRepository = this.getBelieversRepository(qr);

    const believer = await believersRepository.findOne({
      where: {
        id: believerId,
        churchId,
      },
      relations,
    });

    if (!believer) {
      throw new NotFoundException('존재하지 않는 교인입니다.');
    }

    return new ResponseGetDto<BelieverModel>(believer);
  }

  async getBelieverByNameAndMobilePhone(
    churchId: number,
    name: string,
    mobilePhone: string,
    relations?: FindOptionsRelations<BelieverModel>,
    qr?: QueryRunner,
  ) {
    const believersRepository = this.getBelieversRepository(qr);

    const believer = await believersRepository.findOne({
      where: {
        churchId,
        name,
        mobilePhone,
      },
      relations,
    });

    if (!believer) {
      throw new NotFoundException('존재하지 않는 교인입니다.');
    }

    return believer;
  }

  async createBelievers(
    churchId: number,
    dto: CreateBelieverDto,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesService.findById(churchId, qr);

    const believersRepository = this.getBelieversRepository(qr);

    const isExist = await this.isExistBeliever(
      churchId,
      dto.name,
      dto.mobilePhone,
      qr,
    );

    if (isExist) {
      throw new BadRequestException('이미 존재하는 휴대전화 번호입니다.');
    }

    if (dto.guidedById) {
      const guide = await believersRepository.findOne({
        where: {
          churchId,
          id: dto.guidedById,
        },
      });

      if (!guide) {
        throw new NotFoundException(
          '같은 교회에 해당 교인이 존재하지 않습니다.',
        );
      }
    }

    const newBeliever = await believersRepository.save({ ...dto, church });

    return believersRepository.findOne({ where: { id: newBeliever.id } });
  }

  async updateBeliever(
    churchId: number,
    believerId: number,
    dto: UpdateBelieverDto,
    qr?: QueryRunner,
  ) {
    const believersRepository = this.getBelieversRepository(qr);

    if (dto.guidedById) {
      const guide = await believersRepository.findOne({
        where: {
          churchId,
          id: dto.guidedById,
        },
      });

      if (!guide) {
        throw new NotFoundException(
          '같은 교회에 해당 교인이 존재하지 않습니다.',
        );
      }
    }

    const result = await believersRepository.update(
      { id: believerId, churchId, deletedAt: IsNull() },
      { ...dto },
    );

    if (result.affected === 0) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    return believersRepository.findOne({
      where: { id: believerId },
      relations: { guiding: true, guidedBy: true },
    });
  }

  async deleteBeliever(churchId: number, believerId: number) {
    const result = await this.believersRepository.softDelete({
      id: believerId,
      churchId,
      deletedAt: IsNull(),
    });

    if (result.affected === 0) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    return {
      timestamp: new Date(),
      success: true,
      resultId: believerId,
    };
  }

  async isExistBeliever(
    churchId: number,
    name: string,
    mobilePhone: string,
    qr?: QueryRunner,
  ) {
    const believerRepository = this.getBelieversRepository(qr);

    const believer = await believerRepository.findOne({
      where: { churchId, name, mobilePhone },
    });

    return !!believer;
  }
}
