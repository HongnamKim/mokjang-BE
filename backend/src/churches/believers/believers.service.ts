import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BelieverModel } from './entity/believer.entity';
import { IsNull, QueryRunner, Repository } from 'typeorm';
import { ChurchesService } from '../churches.service';
import { CreateBelieverDto } from './dto/create-believer.dto';
import { UpdateBelieverDto } from './dto/update-believer.dto';

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

  async getBelievers(churchId: number, qr?: QueryRunner) {
    const believersRepository = this.getBelieversRepository(qr);

    //const church = await this.churchesService.findById(churchId, qr);

    return believersRepository.find({
      where: {
        churchId,
      },
    });
  }

  async getBelieversById(churchId: number, believerId: number) {
    const believer = await this.believersRepository.findOne({
      where: {
        id: believerId,
        churchId,
      },
      relations: {
        guidedBy: true,
        guiding: true,
      },
    });

    if (!believer) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    return believer;
  }

  async createBelievers(
    churchId: number,
    dto: CreateBelieverDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesService.findById(churchId);

    const believersRepository = this.getBelieversRepository(qr);

    const isExist = await this.isExistBeliever(churchId, dto.mobilePhone, qr);

    if (isExist) {
      throw new BadRequestException('이미 존재하는 휴대전화 번호입니다.');
    }

    const newBeliever = await believersRepository.save({ ...dto, church });

    return believersRepository.findOne({ where: { id: newBeliever.id } });
  }

  async updateBeliever(
    churchId: number,
    believerId: number,
    dto: UpdateBelieverDto,
  ) {
    const result = await this.believersRepository.update(
      { id: believerId, churchId, deletedAt: IsNull() },
      { ...dto },
    );

    if (result.affected === 0) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    return this.believersRepository.findOne({
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
    mobilePhone: string,
    qr?: QueryRunner,
  ) {
    const believerRepository = this.getBelieversRepository(qr);

    const believer = await believerRepository.findOne({
      where: { churchId, mobilePhone },
    });

    return !!believer;
  }
}
