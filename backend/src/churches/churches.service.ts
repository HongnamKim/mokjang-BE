import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChurchModel } from './entity/church.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreateChurchDto } from './dto/create-church.dto';

@Injectable()
export class ChurchesService {
  constructor(
    @InjectRepository(ChurchModel)
    private readonly churchRepository: Repository<ChurchModel>,
  ) {}

  private getChurchRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(ChurchModel) : this.churchRepository;
  }

  findAll() {
    return this.churchRepository.find();
  }

  async findById(id: number) {
    const churchRepository = this.getChurchRepository();

    const church = await churchRepository.findOne({
      where: {
        id,
      },
      relations: {
        invitations: true,
      },
    });

    if (!church) {
      throw new NotFoundException('해당 교회를 찾을 수 없습니다.');
    }

    return church;
  }

  async createChurch(dto: CreateChurchDto, qr?: QueryRunner) {
    const churchRepository = this.getChurchRepository(qr);

    return churchRepository.save({ ...dto });
  }

  async deleteChurchById(id: number, qr?: QueryRunner) {
    const churchRepository = this.getChurchRepository(qr);

    const result = await churchRepository.softDelete({ id });

    if (result.affected === 0) {
      throw new NotFoundException('찾을 수 없습니다.');
    }

    return true;
  }

  /**
   * 초대 횟수 초기화 메소드
   * @param church 초기화 대상 교회
   */
  initInvitationAttempts(church: ChurchModel) {
    return this.churchRepository.update(church, { dailyInvitationAttempts: 0 });
  }

  increaseInvitationAttempts(church: ChurchModel) {
    return this.churchRepository.increment(
      church,
      'dailyInvitationAttempts',
      1,
    );
  }
}
