import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PositionModel } from '../entity/position.entity';
import { QueryRunner, Repository } from 'typeorm';
import { ChurchesService } from '../../churches.service';
import { CreatePositionDto } from '../dto/position/create-position.dto';
import { UpdatePositionDto } from '../dto/position/update-position.dto';
import { SETTING_EXCEPTION } from '../exception-messages/exception-messages.const';

@Injectable()
export class PositionsService {
  constructor(
    @InjectRepository(PositionModel)
    private readonly positionsRepository: Repository<PositionModel>,
    private readonly churchesService: ChurchesService,
  ) {}

  private getPositionsRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(PositionModel)
      : this.positionsRepository;
  }

  private async checkChurchExist(churchId: number) {
    const isExistChurch = await this.churchesService.isExistChurch(churchId);

    if (!isExistChurch) {
      throw new NotFoundException('해당 교회를 찾을 수 없습니다.');
    }
  }

  private async isExistPosition(churchId: number, name: string) {
    const position = await this.positionsRepository.findOne({
      where: {
        churchId,
        name,
      },
    });

    return !!position;
  }

  async getPositions(churchId: number) {
    await this.checkChurchExist(churchId);

    return this.positionsRepository.find({ where: { churchId: churchId } });
  }

  async postPosition(churchId: number, dto: CreatePositionDto) {
    await this.checkChurchExist(churchId);

    if (await this.isExistPosition(churchId, dto.name)) {
      throw new BadRequestException(SETTING_EXCEPTION.POSITION.ALREADY_EXIST);
    }

    return this.positionsRepository.save({ name: dto.name, churchId });
  }

  async updatePosition(
    churchId: number,
    positionId: number,
    dto: UpdatePositionDto,
  ) {
    // 존재하는 교회인지?
    await this.checkChurchExist(churchId);

    // 바꾸려는 이름이 이미 존재하는지
    if (await this.isExistPosition(churchId, dto.name)) {
      throw new BadRequestException(SETTING_EXCEPTION.POSITION.ALREADY_EXIST);
    }

    const result = await this.positionsRepository.update(
      { id: positionId },
      { name: dto.name },
    );

    if (result.affected === 0) {
      throw new NotFoundException(SETTING_EXCEPTION.POSITION.NOT_FOUND);
    }

    return this.positionsRepository.findOne({ where: { id: positionId } });
  }

  async deletePosition(churchId: number, positionId: number) {
    await this.checkChurchExist(churchId);

    const result = await this.positionsRepository.softDelete({
      id: positionId,
      churchId,
    });

    if (result.affected === 0) {
      throw new NotFoundException(SETTING_EXCEPTION.POSITION.NOT_FOUND);
    }

    return 'ok';
  }
}
