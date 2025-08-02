import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EducationModel } from '../../../entity/education.entity';
import {
  FindOptionsOrder,
  FindOptionsRelations,
  ILike,
  IsNull,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { GetEducationDto } from '../../../dto/education/get-education.dto';
import { EducationException } from '../../../const/exception/education.exception';
import { CreateEducationDto } from '../../../dto/education/create-education.dto';
import { UpdateEducationDto } from '../../../dto/education/update-education.dto';
import { IEducationDomainService } from '../interface/education-domain.service.interface';
import { ChurchModel } from '../../../../churches/entity/church.entity';
import {
  MemberSummarizedRelation,
  MemberSummarizedSelect,
} from '../../../../members/const/member-find-options.const';
import { ChurchUserModel } from '../../../../church-user/entity/church-user.entity';
import { MemberException } from '../../../../members/exception/member.exception';

@Injectable()
export class EducationDomainService implements IEducationDomainService {
  constructor(
    @InjectRepository(EducationModel)
    private readonly educationsRepository: Repository<EducationModel>,
  ) {}

  private getEducationsRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationModel)
      : this.educationsRepository;
  }

  private async isExistEducationName(
    church: ChurchModel,
    educationName: string,
    qr?: QueryRunner,
  ) {
    const educationsRepository = this.getEducationsRepository(qr);

    const isExist = await educationsRepository.findOne({
      where: {
        churchId: church.id,
        name: educationName,
      },
    });

    return !!isExist;
  }

  countAllEducations(church: ChurchModel, qr: QueryRunner): Promise<number> {
    const repository = this.getEducationsRepository(qr);

    return repository.count({
      where: {
        churchId: church.id,
      },
    });
  }

  async findEducations(
    church: ChurchModel,
    dto: GetEducationDto,
    qr?: QueryRunner,
  ) {
    const educationsRepository = this.getEducationsRepository(qr);

    const order: FindOptionsOrder<EducationModel> = {
      [dto.order]: dto.orderDirection,
      id: dto.orderDirection,
    };

    return educationsRepository.find({
      where: {
        churchId: church.id,
        name: dto.name && ILike(`%${dto.name}%`),
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        name: true,
        descriptionSummary: true,
        churchId: true,
      },
      order,
      take: dto.take,
      skip: dto.take * (dto.page - 1),
    });
  }

  async findEducationById(
    church: ChurchModel,
    educationId: number,
    qr?: QueryRunner,
  ): Promise<EducationModel> {
    const educationsRepository = this.getEducationsRepository(qr);

    const education = await educationsRepository.findOne({
      where: {
        churchId: church.id,
        id: educationId,
      },
      relations: {
        creator: MemberSummarizedRelation,
      },
      select: {
        creator: MemberSummarizedSelect,
      },
    });

    if (!education) {
      throw new NotFoundException(EducationException.NOT_FOUND);
    }

    return education;
  }

  async findEducationModelById(
    church: ChurchModel,
    educationId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<EducationModel>,
  ): Promise<EducationModel> {
    const educationsRepository = this.getEducationsRepository(qr);

    const education = await educationsRepository.findOne({
      where: {
        id: educationId,
        churchId: church.id,
      },
      relations: relationOptions,
    });

    if (!education) {
      throw new NotFoundException(EducationException.NOT_FOUND);
    }

    return education;
  }

  async createEducation(
    church: ChurchModel,
    creatorManager: ChurchUserModel,
    dto: CreateEducationDto,
    qr?: QueryRunner,
  ) {
    const educationsRepository = this.getEducationsRepository(qr);

    const isExist = await this.isExistEducationName(church, dto.name, qr);

    if (isExist) {
      throw new BadRequestException(EducationException.ALREADY_EXIST);
    }

    if (!creatorManager.member) {
      throw new InternalServerErrorException(MemberException.USER_ERROR);
    }

    return educationsRepository.save({
      name: dto.name,
      description: dto.description,
      descriptionSummary: dto.descriptionSummary,
      creatorId: creatorManager.member.id,
      churchId: church.id,
      goals: dto.goals,
    });
  }

  async updateEducation(
    church: ChurchModel,
    targetEducation: EducationModel,
    dto: UpdateEducationDto,
    qr: QueryRunner,
  ) {
    const educationsRepository = this.getEducationsRepository(qr);

    const isExist = dto.name
      ? await this.isExistEducationName(church, dto.name, qr)
      : false;

    if (isExist) {
      throw new BadRequestException(EducationException.ALREADY_EXIST);
    }

    const result = await educationsRepository.update(
      {
        id: targetEducation.id,
      },
      {
        name: dto.name,
        description: dto.description,
        descriptionSummary: dto.descriptionSummary,
        goals: dto.goals,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(EducationException.UPDATE_ERROR);
    }

    return result;
  }

  async deleteEducation(targetEducation: EducationModel, qr?: QueryRunner) {
    const educationsRepository = this.getEducationsRepository(qr);

    const result = await educationsRepository.softDelete({
      id: targetEducation.id,
      deletedAt: IsNull(),
    });

    if (result.affected === 0) {
      throw new InternalServerErrorException(EducationException.DELETE_ERROR);
    }

    return;
  }

  async incrementTermsCount(
    education: EducationModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getEducationsRepository(qr);

    const result = await repository.increment(
      { id: education.id },
      'termsCount',
      1,
    );
    if (result.affected === 0) {
      throw new InternalServerErrorException(EducationException.UPDATE_ERROR);
    }

    return result;
  }

  async decrementTermsCount(
    education: EducationModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getEducationsRepository(qr);

    const result = await repository.decrement(
      { id: education.id },
      'termsCount',
      1,
    );
    if (result.affected === 0) {
      throw new InternalServerErrorException(EducationException.UPDATE_ERROR);
    }

    return result;
  }

  async incrementCompletionMembersCount(
    education: EducationModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getEducationsRepository(qr);

    const result = await repository.increment(
      { id: education.id },
      'completionMembersCount',
      1,
    );
    if (result.affected === 0) {
      throw new InternalServerErrorException(EducationException.UPDATE_ERROR);
    }

    return result;
  }

  async decrementCompletionMembersCount(
    education: EducationModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getEducationsRepository(qr);

    const result = await repository.decrement(
      { id: education.id },
      'completionMembersCount',
      1,
    );
    if (result.affected === 0) {
      throw new InternalServerErrorException(EducationException.UPDATE_ERROR);
    }

    return result;
  }
}
