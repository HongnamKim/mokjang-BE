import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IChurchesDomainService } from '../interface/churches-domain.service.interface';
import { CreateChurchDto } from '../../dto/create-church.dto';
import {
  FindOptionsRelations,
  IsNull,
  QueryFailedError,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { ChurchModel } from '../../entity/church.entity';
import { UpdateChurchDto } from '../../dto/update-church.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from '../../../user/const/user-role.enum';
import { RequestLimitValidationType } from '../../../request-info/types/request-limit-validation-result';
import { ChurchException } from '../../const/exception/church.exception';

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

    return churchRepository.save({
      ...dto,
      joinCode: await this.generateUniqueChurchCode(churchRepository),
    });
  }

  async generateUniqueChurchCode(
    churchRepo: Repository<ChurchModel>,
  ): Promise<string> {
    let code: string;
    let exists = true;

    do {
      code = this.generateChurchJoinCode();
      exists = await churchRepo.exists({ where: { joinCode: code } });
    } while (exists);

    return code;
  }

  private generateChurchJoinCode(length = 6): string {
    const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    let code = '';

    for (let i = 0; i < length; i++) {
      code += CHARSET[Math.floor(Math.random() * CHARSET.length)];
    }

    return code;
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

  async findChurchModelByJoinCode(
    joinCode: string,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<ChurchModel>,
  ): Promise<ChurchModel> {
    const churchesRepository = this.getChurchRepository(qr);

    const church = await churchesRepository.findOne({
      where: {
        joinCode,
      },
      relations: relationOptions,
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

  async updateChurchJoinCode(
    church: ChurchModel,
    newCode: string,
    qr: QueryRunner | undefined,
  ): Promise<UpdateResult> {
    try {
      const churchRepository = this.getChurchRepository(qr);

      return await churchRepository.update(
        { id: church.id },
        { joinCode: newCode },
      );
    } catch (e) {
      if (e instanceof QueryFailedError && (e as any).code === '23505') {
        // 23505 = unique_violation (Postgres 기준)
        throw new ConflictException(ChurchException.ALREADY_EXIST_JOIN_CODE);
      }

      throw e; // 다른 에러는 그대로 전파
    }
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

  async getChurchOwnerIds(
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
      .filter((user) => user.role === UserRole.OWNER)
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
          user.role === UserRole.MANAGER || user.role === UserRole.OWNER,
      )
      .map((manager) => manager.id);
  }

  async incrementMemberCount(
    church: ChurchModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const churchesRepository = this.getChurchRepository(qr);

    const result = await churchesRepository.increment(
      { id: church.id },
      'memberCount',
      1,
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(ChurchException.UPDATE_ERROR);
    }

    return result;
  }

  async decrementMemberCount(
    church: ChurchModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const churchesRepository = this.getChurchRepository(qr);

    const result = await churchesRepository.decrement(
      { id: church.id },
      'memberCount',
      1,
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(ChurchException.UPDATE_ERROR);
    }

    return result;
  }
}
