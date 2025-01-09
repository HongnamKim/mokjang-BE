import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { EducationStatus } from '../../members-settings/const/education-status.enum';
import { EducationModel } from '../entity/education/education.entity';
import { GetEducationDto } from '../dto/education/education/get-education.dto';
import { CreateEducationDto } from '../dto/education/education/create-education.dto';
import { UpdateEducationDto } from '../dto/education/education/update-education.dto';
import { EducationException } from '../const/exception/education/education.exception';
import { EducationTermModel } from '../entity/education/education-term.entity';
import { GetEducationTermDto } from '../dto/education/terms/get-education-term.dto';
import {
  EducationOrderEnum,
  EducationTermOrderEnum,
} from '../const/education/order.enum';
import { CreateEducationTermDto } from '../dto/education/terms/create-education-term.dto';
import { UpdateEducationTermDto } from '../dto/education/terms/update-education-term.dto';

@Injectable()
export class EducationsService {
  constructor(
    @InjectRepository(EducationModel)
    private readonly educationsRepository: Repository<EducationModel>,
    @InjectRepository(EducationTermModel)
    private readonly educationTermsRepository: Repository<EducationTermModel>,
  ) {}

  private CountColumnMap = {
    [EducationStatus.IN_PROGRESS]: 'inProgressCount',
    [EducationStatus.COMPLETED]: 'completedCount',
    [EducationStatus.INCOMPLETE]: 'incompleteCount',
  };

  private getEducationsRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationModel)
      : this.educationsRepository;
  }

  getEducations(churchId: number, dto: GetEducationDto, qr?: QueryRunner) {
    const educationsRepository = this.getEducationsRepository(qr);

    return educationsRepository.find({
      where: {
        churchId,
      },
      order: {
        [dto.order]: dto.orderDirection,
        createdAt:
          dto.order === EducationOrderEnum.createdAt ? undefined : 'desc',
      },
    });
  }

  async getEducationById(
    churchId: number,
    educationId: number,
    qr?: QueryRunner,
  ) {
    const educationsRepository = this.getEducationsRepository(qr);

    const education = await educationsRepository.findOne({
      where: {
        id: educationId,
      },
    });

    if (!education) {
      throw new BadRequestException(EducationException.NOT_FOUND);
    }

    return education;
  }

  async isExistEducation(
    churchId: number,
    educationName: string,
    withDeleted: boolean,
    qr?: QueryRunner,
  ) {
    const educationsRepository = this.getEducationsRepository(qr);

    return educationsRepository.findOne({
      where: {
        churchId,
        name: educationName,
      },
      withDeleted,
    });
  }

  async createEducation(
    churchId: number,
    dto: CreateEducationDto,
    qr?: QueryRunner,
  ) {
    const educationsRepository = this.getEducationsRepository(qr);

    // 교육 이름 중복 체크
    const existEducation = await this.isExistEducation(
      churchId,
      dto.name,
      false,
      qr,
    );

    if (existEducation) {
      throw new BadRequestException(EducationException.ALREADY_EXIST);
    }

    return educationsRepository.save({
      name: dto.name,
      description: dto.description,
      churchId,
    });
  }

  async updateEducation(
    churchId: number,
    educationId: number,
    dto: UpdateEducationDto,
    qr?: QueryRunner,
  ) {
    const educationsRepository = this.getEducationsRepository(qr);

    const education = await educationsRepository.findOne({
      where: { id: educationId },
    });

    if (!education) {
      throw new NotFoundException(EducationException.NOT_FOUND);
    }

    const existEducation = dto.name
      ? await this.isExistEducation(churchId, dto.name, false, qr)
      : false;

    if (existEducation) {
      if (existEducation.deletedAt !== null) {
        await educationsRepository.delete({ id: existEducation.id });
      } else {
        throw new BadRequestException(EducationException.ALREADY_EXIST);
      }
    }

    await educationsRepository.update(
      {
        id: educationId,
      },
      {
        name: dto.name,
        description: dto.description,
      },
    );

    return educationsRepository.findOne({ where: { id: educationId } });
  }

  async deleteEducation(
    churchId: number,
    educationId: number,
    qr?: QueryRunner,
  ) {
    const educationsRepository = this.getEducationsRepository(qr);

    const result = await educationsRepository.softDelete({ id: educationId });

    if (result.affected === 0) {
      throw new NotFoundException(EducationException.NOT_FOUND);
    }

    return `educationId: ${educationId} deleted`;
  }

  private getEducationTermsRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationTermModel)
      : this.educationTermsRepository;
  }

  async getEducationTerms(
    churchId: number,
    educationId: number,
    dto: GetEducationTermDto,
    qr?: QueryRunner,
  ) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    return educationTermsRepository.find({
      where: {
        educationId: educationId,
      },
      order: {
        [dto.order]: dto.orderDirection,
        createdAt:
          dto.order === EducationTermOrderEnum.createdAt ? undefined : 'desc',
      },
    });
  }

  async getEducationTermById(
    churchId: number,
    educationId: number,
    educationTermId: number,
    qr?: QueryRunner,
  ) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const educationTerm = await educationTermsRepository.findOne({
      where: {
        id: educationTermId,
        educationId,
      },
    });

    if (!educationTerm) {
      throw new NotFoundException('해당 교육 기수를 찾을 수 없습니다.');
    }

    return educationTerm;
  }

  async createEducationTerm(
    churchId: number,
    educationId: number,
    dto: CreateEducationTermDto,
    qr?: QueryRunner,
  ) {
    //const educationsRepository = this.getEducationsRepository(qr);
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    //const education = await this.getEducationById(churchId, educationId, qr);

    const lastTerm = await educationTermsRepository.findOne({
      where: {
        educationId,
      },
      order: {
        term: 'desc',
      },
    });

    const newTerm = lastTerm ? lastTerm.term + 1 : 1;

    const educationTerm = await educationTermsRepository.save({
      educationId,
      term: newTerm,
      numberOfSessions: dto.numberOfSessions,
      completionCriteria: dto.completionCriteria,
      startDate: dto.startDate,
      endDate: dto.endDate,
      instructorId: dto.instructorId,
    });

    return educationTermsRepository.findOne({
      where: { id: educationTerm.id },
    });
  }

  private validateUpdateEducationTerm(
    dto: UpdateEducationTermDto,
    educationTerm: EducationTermModel,
  ) {
    if (dto.numberOfSessions && !dto.completionCriteria) {
      if (
        educationTerm.completionCriteria &&
        dto.numberOfSessions < educationTerm.completionCriteria
      ) {
        throw new BadRequestException(
          '교육 회차는 이수 조건보다 크거나 같아야합니다.',
        );
      }
    }

    if (dto.completionCriteria && !dto.numberOfSessions) {
      if (dto.completionCriteria > educationTerm.numberOfSessions) {
        throw new BadRequestException(
          '이수 조건은 교육 회차보다 작거나 같아야합니다.',
        );
      }
    }

    if (dto.startDate && !dto.endDate) {
      if (dto.startDate > educationTerm.endDate) {
        throw new BadRequestException(
          '교육 시작일은 종료일보다 뒤일 수 없습니다.',
        );
      }
    }

    if (dto.endDate && !dto.startDate) {
      if (educationTerm.startDate > dto.endDate) {
        throw new BadRequestException(
          '교육 종료일은 시작일보다 앞설 수 없습니다.',
        );
      }
    }

    /*
    교육 진행자 검증
     */
  }

  async updateEducationTerm(
    churchId: number,
    educationId: number,
    educationTermId: number,
    dto: UpdateEducationTermDto,
    qr?: QueryRunner,
  ) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const educationTerm = await this.getEducationTermById(
      churchId,
      educationId,
      educationTermId,
      qr,
    );

    /*
    1. 교육회차만 업데이트
      1-1. 기존 이수조건보다 큰 경우 --> 정상 업데이트
      1-2. 기존 이수조건보다 작은 경우 --> 교육회차는 이수조건보다 크거나 같아야함. BadRequestException

    2. 교육회차 + 이수조건 업데이트
      2-1. DTO 에서 교육회차가 이수조건 이상으로 검증 --> 정상 업데이트

    3. 이수조건 업데이트
      3-1. 교육회차보다 이하인 경우 --> 정상 업데이트
      3-2. 교육회차보다 큰 경우 --> 이수조건은 교육회차보다 작거나 같아야함. BadRequestException

    4. 시작일 업데이트
      4-1. 기존 종료일보다 앞선 경우 --> 정상 업데이트
      4-2. 기존 종요일보다 뒤인 경우 --> 시작일은 종료일 뒤의 날짜일 수 없음. BadRequestException

    5. 시작일 + 종료일 업데이트
      5-1. DTO 에서 검증 완료 --> 정상 업데이트

    6. 종료일 업데이트
      6-1. 기존 시작일보다 뒤인 경우 --> 정상 업데이트
      6-2. 기존 시작일보다 앞일 경우 --> 종료일은 시작일을 앞설 수 없음. BadRequestException

    7. 진행자 업데이트
      7-1. 진행자가 해당 교회에 소속 --> 정상 업데이트
      7-2. 진행자가 해당 교회에 소속X --> 해당 교인을 찾을 수 없음. NotFoundException
     */

    this.validateUpdateEducationTerm(dto, educationTerm);

    await educationTermsRepository.update(
      {
        id: educationTermId,
      },
      {
        ...dto,
      },
    );

    return educationTermsRepository.findOne({ where: { id: educationTermId } });
  }

  async deleteEducationTerm(
    educationId: number,
    educationTermId: number,
    qr?: QueryRunner,
  ) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const result = await educationTermsRepository.softDelete({
      educationId,
      id: educationTermId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('해당 교육 기수를 찾을 수 없습니다.');
    }

    return `educationTermId: ${educationTermId} deleted`;
  }

  async incrementMemberCount(
    educationId: number,
    status: EducationStatus,
    qr: QueryRunner,
  ) {
    /*const educationsRepository = this.getEducationsRepository(qr);

    const result = await educationsRepository.increment(
      { id: educationId },
      this.CountColumnMap[status],
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException(SETTING_EXCEPTION.EducationModel.NOT_FOUND);
    }

    return educationsRepository.findOne({ where: { id: educationId } });*/
  }

  async decrementMemberCount(
    educationId: number,
    status: EducationStatus,
    qr: QueryRunner,
  ) {
    /*const educationsRepository = this.getEducationsRepository(qr);

    const result = await educationsRepository.decrement(
      { id: educationId },
      this.CountColumnMap[status],
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException(SETTING_EXCEPTION.EducationModel.NOT_FOUND);
    }

    return educationsRepository.findOne({ where: { id: educationId } });*/
  }
}
