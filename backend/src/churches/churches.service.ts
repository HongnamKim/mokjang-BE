import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChurchModel } from './entity/church.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreateChurchDto } from './dto/create-church.dto';
import { JwtAccessPayload } from '../auth/type/jwt';
import { UpdateChurchDto } from './dto/update-church.dto';
import { RequestLimitValidationType } from './request-info/types/request-limit-validation-result';

@Injectable()
export class ChurchesService {
  constructor(
    @InjectRepository(ChurchModel)
    private readonly churchRepository: Repository<ChurchModel>,
  ) {}

  private getChurchRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(ChurchModel) : this.churchRepository;
  }

  findAllChurches() {
    return this.churchRepository.find();
  }

  async isChurchAdmin(churchId: number, memberId: number, qr?: QueryRunner) {
    const church = await this.getChurchById(churchId, qr);

    const subAdminIds = church.subAdmins.map((subAdmin) => subAdmin.id);

    const allAdminIds = [church.mainAdmin.id, ...subAdminIds];

    return allAdminIds.includes(memberId);
  }

  async isChurchMainAdmin(
    churchId: number,
    memberId: number,
    qr?: QueryRunner,
  ) {
    const church = await this.getChurchById(churchId, qr);

    return church.mainAdmin.id === memberId;
  }

  async getChurchById(id: number, qr?: QueryRunner) {
    const churchRepository = this.getChurchRepository(qr);

    const church = await churchRepository.findOne({
      where: {
        id,
      },
      relations: {
        //requestInfos: true,
        mainAdmin: true,
        subAdmins: true,
      },
    });

    if (!church) {
      throw new NotFoundException('해당 교회를 찾을 수 없습니다.');
    }

    return church;
  }

  async getChurchModelById(churchId: number, qr?: QueryRunner) {
    const churchRepository = this.getChurchRepository(qr);

    const church = await churchRepository.findOne({
      where: {
        id: churchId,
      },
    });

    if (!church) {
      throw new NotFoundException('해당 교회를 찾을 수 없습니다.');
    }

    return church;
  }

  async isExistChurch(id: number, qr?: QueryRunner) {
    const churchRepository = this.getChurchRepository(qr);

    const church = await churchRepository.findOne({ where: { id } });

    return !!church;
  }

  async createChurch(
    accessToken: JwtAccessPayload,
    dto: CreateChurchDto,
    qr?: QueryRunner,
  ) {
    const churchRepository = this.getChurchRepository(qr);

    const isMainAdmin = await churchRepository.findOne({
      where: {
        mainAdmin: {
          id: accessToken.id,
        },
      },
    });

    if (isMainAdmin) {
      throw new BadRequestException('이미 생성한 교회가 있습니다.');
    }

    const isDuplicated = await churchRepository.findOne({
      where: {
        name: dto.name,
        identifyNumber: dto.identifyNumber,
      },
    });

    if (isDuplicated) {
      throw new BadRequestException('이미 존재하는 교회입니다.');
    }

    return churchRepository.save({
      ...dto,
      mainAdmin: {
        id: accessToken.id,
      },
    });
  }

  async updateChurch(churchId: number, dto: UpdateChurchDto) {
    const churchRepository = this.getChurchRepository();

    const result = await churchRepository.update(
      {
        id: churchId,
      },
      {
        ...dto,
      },
    );

    if (result.affected === 0) {
      throw new NotFoundException('');
    }

    return this.getChurchById(churchId);
  }

  async deleteChurchById(id: number, qr?: QueryRunner) {
    const churchRepository = this.getChurchRepository(qr);

    const result = await churchRepository.softDelete({ id });

    if (result.affected === 0) {
      throw new NotFoundException('해당 교회를 찾을 수 없습니다.');
    }

    return `churchId: ${id} deleted`;
  }

  /**
   * 초대 횟수 초기화 메소드
   * @param church 초기화 대상 교회
   * @param qr QueryRunner
   */
  initRequestAttempts(church: ChurchModel, qr: QueryRunner) {
    const churchRepository = this.getChurchRepository(qr);

    return churchRepository.update(
      { id: church.id },
      { dailyRequestAttempts: 1, lastRequestDate: new Date() },
    );
  }

  increaseRequestAttempts(church: ChurchModel, qr: QueryRunner) {
    const churchRepository = this.getChurchRepository(qr);

    return churchRepository.update(
      { id: church.id },
      {
        lastRequestDate: new Date(),
        dailyRequestAttempts: () => 'dailyRequestAttempts + 1',
      },
    );
  }

  updateRequestAttempts(
    church: ChurchModel,
    validationResultType:
      | RequestLimitValidationType.INIT
      | RequestLimitValidationType.INCREASE,
    qr: QueryRunner,
  ) {
    const churchRepository = this.getChurchRepository(qr);

    return churchRepository.update(
      { id: church.id },
      {
        lastRequestDate: new Date(),
        dailyRequestAttempts:
          validationResultType === RequestLimitValidationType.INCREASE
            ? () => 'dailyRequestAttempts + 1'
            : 1,
      },
    );
  }
}
