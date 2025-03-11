import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { EducationModel } from '../../entity/education/education.entity';
import { GetEducationDto } from '../../dto/education/education/get-education.dto';
import { CreateEducationDto } from '../../dto/education/education/create-education.dto';
import { UpdateEducationDto } from '../../dto/education/education/update-education.dto';
import { EducationException } from '../../const/exception/education/education.exception';
import { EducationOrderEnum } from '../../const/education/order.enum';
import { EducationTermSyncService } from '../education-sync/education-term-sync.service';

@Injectable()
export class EducationsService {
  constructor(
    @InjectRepository(EducationModel)
    private readonly educationsRepository: Repository<EducationModel>,
    private readonly educationTermsEducationSyncService: EducationTermSyncService,
  ) {}

  private getEducationsRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationModel)
      : this.educationsRepository;
  }

  async getEducations(
    churchId: number,
    dto: GetEducationDto,
    qr?: QueryRunner,
  ) {
    const educationsRepository = this.getEducationsRepository(qr);

    const [result, totalCount] = await Promise.all([
      educationsRepository.find({
        where: {
          churchId,
        },
        order: {
          [dto.order]: dto.orderDirection,
          createdAt:
            dto.order === EducationOrderEnum.createdAt ? undefined : 'desc',
        },
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),
      educationsRepository.count({
        where: {
          churchId,
        },
      }),
    ]);

    return {
      data: result,
      totalCount,
      count: result.length,
      page: dto.page,
    };
  }

  async getEducationById(
    churchId: number,
    educationId: number,
    qr?: QueryRunner,
  ) {
    const educationsRepository = this.getEducationsRepository(qr);

    const education = await educationsRepository.findOne({
      where: {
        churchId,
        id: educationId,
      },
      relations: {
        educationTerms: {
          instructor: true,
        },
      },
      order: {
        educationTerms: {
          term: 'asc',
        },
      },
    });

    if (!education) {
      throw new BadRequestException(EducationException.NOT_FOUND);
    }

    return education;
  }

  async isExistEducationName(
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
    const existEducationName = await this.isExistEducationName(
      churchId,
      dto.name,
      false,
      qr,
    );

    if (existEducationName) {
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
    qr: QueryRunner,
  ) {
    const educationsRepository = this.getEducationsRepository(qr);

    const education = await educationsRepository.findOne({
      where: {
        churchId,
        id: educationId,
      },
    });

    if (!education) {
      throw new NotFoundException(EducationException.NOT_FOUND);
    }

    // 바꾸려는 이름이 존재하는 지 확인
    const existEducationName = dto.name
      ? await this.isExistEducationName(churchId, dto.name, false, qr)
      : false;

    if (existEducationName) {
      throw new BadRequestException(EducationException.ALREADY_EXIST);
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

    // 이름 변경 시 하위 기수들의 교육명 업데이트
    if (dto.name) {
      await this.educationTermsEducationSyncService.syncEducationName(
        educationId,
        dto.name,
        qr,
      );
    }

    return educationsRepository.findOne({ where: { id: educationId } });
  }

  async deleteEducation(
    churchId: number,
    educationId: number,
    qr?: QueryRunner,
  ) {
    const educationsRepository = this.getEducationsRepository(qr);

    const result = await educationsRepository.softDelete({
      id: educationId,
      churchId,
    });

    if (result.affected === 0) {
      throw new NotFoundException(EducationException.NOT_FOUND);
    }

    return `educationId: ${educationId} deleted`;
  }
}
