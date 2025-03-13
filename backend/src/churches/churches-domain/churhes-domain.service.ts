import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IChurchesDomainService } from './interface/churches-domain.service.interface';
import { UserModel } from '../../user/entity/user.entity';
import { CreateChurchDto } from '../dto/create-church.dto';
import { IsNull, QueryRunner, Repository, UpdateResult } from 'typeorm';
import { ChurchModel } from '../entity/church.entity';
import { UpdateChurchDto } from '../dto/update-church.dto';
import { RequestLimitValidationType } from '../request-info/types/request-limit-validation-result';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from '../../user/const/user-role.enum';

@Injectable()
export class ChurchesDomainService implements IChurchesDomainService {
  constructor(
    @InjectRepository(ChurchModel)
    private readonly churchRepository: Repository<ChurchModel>,
  ) {}

  private getChurchRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(ChurchModel) : this.churchRepository;
  }

  findAllChurches(): Promise<ChurchModel[]> {
    const churchRepository = this.getChurchRepository();

    return churchRepository.find();
  }

  async createChurch(
    user: UserModel,
    dto: CreateChurchDto,
    qr?: QueryRunner,
  ): Promise<ChurchModel> {
    const churchRepository = this.getChurchRepository(qr);

    const isDuplicated = await churchRepository.findOne({
      where: {
        name: dto.name,
        identifyNumber: dto.identifyNumber,
      },
    });

    if (isDuplicated) {
      throw new BadRequestException('이미 존재하는 교회입니다.');
    }

    const newChurch = churchRepository.create({
      ...dto,
    });

    newChurch.users.push(user);

    return churchRepository.save(newChurch);
  }

  async deleteChurchById(id: number, qr?: QueryRunner): Promise<string> {
    const churchRepository = this.getChurchRepository(qr);

    const result = await churchRepository.softDelete({
      id,
      deletedAt: IsNull(),
    });

    if (result.affected === 0) {
      throw new NotFoundException('해당 교회를 찾을 수 없습니다.');
    }

    return `churchId: ${id} deleted`;
  }

  async findChurchById(id: number, qr?: QueryRunner): Promise<ChurchModel> {
    const churchRepository = this.getChurchRepository(qr);

    const church = await churchRepository.findOne({
      where: {
        id,
      },
      relations: {
        users: true,
      },
    });

    if (!church) {
      throw new NotFoundException('해당 교회를 찾을 수 없습니다.');
    }

    return church;
  }

  async findChurchModelById(
    id: number,
    qr?: QueryRunner,
  ): Promise<ChurchModel> {
    const churchRepository = this.getChurchRepository(qr);

    const church = await churchRepository.findOne({
      where: {
        id,
      },
    });

    if (!church) {
      throw new NotFoundException('해당 교회를 찾을 수 없습니다.');
    }

    return church;
  }

  async isExistChurch(id: number, qr?: QueryRunner): Promise<boolean> {
    const churchRepository = this.getChurchRepository(qr);

    const church = await churchRepository.findOne({ where: { id } });

    return !!church;
  }

  async updateChurch(
    churchId: number,
    dto: UpdateChurchDto,
  ): Promise<ChurchModel> {
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

    return this.findChurchById(churchId);
  }

  updateRequestAttempts(
    church: ChurchModel,
    validationResultType:
      | RequestLimitValidationType.INIT
      | RequestLimitValidationType.INCREASE,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
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

  async getChurchMainAdminIds(
    churchId: number,
    qr?: QueryRunner,
  ): Promise<number[]> {
    const churchRepository = this.getChurchRepository(qr);

    const church = await churchRepository.findOne({
      where: {
        id: churchId,
      },
      relations: {
        users: true,
      },
    });

    if (!church) {
      throw new NotFoundException('해당 교회를 찾을 수 없습니다.');
    }

    return church.users
      .filter((user) => user.role === UserRole.mainAdmin)
      .map((admin) => admin.id);
  }

  async getChurchManagerIds(
    churchId: number,
    qr?: QueryRunner,
  ): Promise<number[]> {
    const churchRepository = this.getChurchRepository(qr);

    const church = await churchRepository.findOne({
      where: {
        id: churchId,
      },
      relations: {
        users: true,
      },
    });

    if (!church) {
      throw new NotFoundException('해당 교회를 찾을 수 없습니다.');
    }

    return church.users
      .filter(
        (user) =>
          user.role === UserRole.manager || user.role === UserRole.mainAdmin,
      )
      .map((manager) => manager.id);
  }
}
