import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IChurchesDomainService } from './interface/churches-domain.service.interface';
import { CreateChurchDto } from '../dto/create-church.dto';
import {
  FindOptionsRelations,
  IsNull,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { ChurchModel } from '../entity/church.entity';
import { UpdateChurchDto } from '../dto/update-church.dto';
import { RequestLimitValidationType } from '../request-info/types/request-limit-validation-result';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from '../../user/const/user-role.enum';
import { ChurchException } from '../const/exception/church.exception';

@Injectable()
export class ChurchesDomainService implements IChurchesDomainService {
  constructor(
    @InjectRepository(ChurchModel)
    private readonly churchRepository: Repository<ChurchModel>,
  ) {}

  private getChurchRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(ChurchModel) : this.churchRepository;
  }

  async findAllChurches(): Promise<ChurchModel[]> {
    const churchRepository = this.getChurchRepository();

    return churchRepository.find();
  }

  async createChurch(
    dto: CreateChurchDto,
    qr: QueryRunner,
  ): Promise<ChurchModel> {
    const churchRepository = this.getChurchRepository(qr);

    const isDuplicated = await churchRepository.findOne({
      where: {
        name: dto.name,
        identifyNumber: dto.identifyNumber,
      },
    });

    if (isDuplicated) {
      throw new ConflictException(ChurchException.ALREADY_EXIST);
    }

    const newChurch = churchRepository.create({
      ...dto,
    });

    return churchRepository.save(newChurch);
  }

  async deleteChurch(church: ChurchModel, qr?: QueryRunner): Promise<string> {
    const churchRepository = this.getChurchRepository(qr);

    const result = await churchRepository.softDelete({
      id: church.id,
      deletedAt: IsNull(),
    });

    if (result.affected === 0) {
      throw new InternalServerErrorException(ChurchException.DELETE_ERROR);
    }

    return `churchId: ${church.id} deleted`;
  }

  async findChurchById(id: number, qr?: QueryRunner): Promise<ChurchModel> {
    const churchRepository = this.getChurchRepository(qr);

    const church = await churchRepository.findOne({
      where: {
        id,
      },
      relations: {
        //users: true,
      },
    });

    if (!church) {
      throw new NotFoundException(ChurchException.NOT_FOUND);
    }

    return church;
  }

  async findChurchModelById(
    id: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<ChurchModel>,
  ): Promise<ChurchModel> {
    const churchRepository = this.getChurchRepository(qr);

    const church = await churchRepository.findOne({
      where: {
        id,
      },
      relations: relationOptions,
    });

    if (!church) {
      throw new NotFoundException(ChurchException.NOT_FOUND);
    }

    return church;
  }

  async isExistChurch(id: number, qr?: QueryRunner): Promise<boolean> {
    const churchRepository = this.getChurchRepository(qr);

    const church = await churchRepository.findOne({ where: { id } });

    return !!church;
  }

  async updateChurch(
    church: ChurchModel,
    dto: UpdateChurchDto,
  ): Promise<ChurchModel> {
    const churchRepository = this.getChurchRepository();

    const result = await churchRepository.update(
      {
        id: church.id,
      },
      {
        ...dto,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(ChurchException.UPDATE_ERROR);
    }

    return this.findChurchById(church.id);
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
      throw new NotFoundException(ChurchException.NOT_FOUND);
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
      throw new NotFoundException(ChurchException.NOT_FOUND);
    }

    return church.users
      .filter(
        (user) =>
          user.role === UserRole.manager || user.role === UserRole.mainAdmin,
      )
      .map((manager) => manager.id);
  }
}
