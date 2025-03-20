import { Inject, Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { GetEducationDto } from '../dto/education/get-education.dto';
import { CreateEducationDto } from '../dto/education/create-education.dto';
import { UpdateEducationDto } from '../dto/education/update-education.dto';
import {
  IEDUCATION_DOMAIN_SERVICE,
  IEducationDomainService,
} from './education-domain/interface/education-domain.service.interface';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IEDUCATION_TERM_DOMAIN_SERVICE,
  IEducationTermDomainService,
} from './education-domain/interface/education-term-domain.service.interface';

@Injectable()
export class EducationsService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchDomainService: IChurchesDomainService,
    @Inject(IEDUCATION_DOMAIN_SERVICE)
    private readonly educationDomainService: IEducationDomainService,
    @Inject(IEDUCATION_TERM_DOMAIN_SERVICE)
    private readonly educationTermDomainService: IEducationTermDomainService,
  ) {}

  async getEducations(
    churchId: number,
    dto: GetEducationDto,
    qr?: QueryRunner,
  ) {
    const church = await this.churchDomainService.findChurchModelById(
      churchId,
      qr,
    );

    return this.educationDomainService.findEducations(church, dto, qr);

    /*const educationsRepository = this.getEducationsRepository(qr);

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
    };*/
  }

  async getEducationById(
    churchId: number,
    educationId: number,
    qr?: QueryRunner,
  ) {
    const church = await this.churchDomainService.findChurchModelById(
      churchId,
      qr,
    );

    return this.educationDomainService.findEducationById(
      church,
      educationId,
      qr,
    );

    /*const educationsRepository = this.getEducationsRepository(qr);

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

    return education;*/
  }

  async createEducation(
    churchId: number,
    dto: CreateEducationDto,
    qr?: QueryRunner,
  ) {
    const church = await this.churchDomainService.findChurchModelById(
      churchId,
      qr,
    );

    return this.educationDomainService.createEducation(church, dto, qr);

    /*const educationsRepository = this.getEducationsRepository(qr);

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
    });*/
  }

  async updateEducation(
    churchId: number,
    educationId: number,
    dto: UpdateEducationDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const education = await this.educationDomainService.findEducationModelById(
      church,
      educationId,
      qr,
    );

    const updatedEducation = await this.educationDomainService.updateEducation(
      church,
      education,
      dto,
      qr,
    );

    /*const educationsRepository = this.getEducationsRepository(qr);

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
    );*/

    // 이름 변경 시 하위 기수들의 교육명 업데이트
    if (dto.name) {
      await this.educationTermDomainService.updateEducationTermName(
        education,
        dto.name,
        qr,
      );
    }

    return updatedEducation;
  }

  async deleteEducation(
    churchId: number,
    educationId: number,
    qr?: QueryRunner,
  ) {
    const church = await this.churchDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const targetEducation =
      await this.educationDomainService.findEducationModelById(
        church,
        educationId,
        qr,
      );

    return this.educationDomainService.deleteEducation(targetEducation, qr);

    /*const educationsRepository = this.getEducationsRepository(qr);

    const result = await educationsRepository.softDelete({
      id: educationId,
      churchId,
    });

    if (result.affected === 0) {
      throw new NotFoundException(EducationException.NOT_FOUND);
    }

    return `educationId: ${educationId} deleted`;*/
  }
}
