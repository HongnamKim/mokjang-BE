import { Inject, Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { GetEducationTermDto } from '../dto/terms/get-education-term.dto';
import { CreateEducationTermDto } from '../dto/terms/create-education-term.dto';
import { UpdateEducationTermDto } from '../dto/terms/update-education-term.dto';
import { EducationTermAttendanceSyncService } from './sync/education-term-attendance-sync.service';
import { MembersService } from '../../../churches/members/service/members.service';
import {
  IEDUCATION_TERM_DOMAIN_SERVICE,
  IEducationTermDomainService,
} from './education-domain/interface/education-term-domain.service.interface';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IEDUCATION_DOMAIN_SERVICE,
  IEducationDomainService,
} from './education-domain/interface/education-domain.service.interface';
import {
  IEDUCATION_SESSION_DOMAIN_SERVICE,
  IEducationSessionDomainService,
} from './education-domain/interface/education-session-domain.service.interface';

@Injectable()
export class EducationTermService {
  constructor(
    private readonly membersService: MembersService,
    //private readonly educationTermSessionSyncService: EducationTermSessionSyncService,
    private readonly educationTermAttendanceSyncService: EducationTermAttendanceSyncService,

    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IEDUCATION_DOMAIN_SERVICE)
    private readonly educationDomainService: IEducationDomainService,
    @Inject(IEDUCATION_TERM_DOMAIN_SERVICE)
    private readonly educationTermDomainService: IEducationTermDomainService,
    @Inject(IEDUCATION_SESSION_DOMAIN_SERVICE)
    private readonly educationSessionDomainService: IEducationSessionDomainService,
  ) {}

  async getEducationTerms(
    churchId: number,
    educationId: number,
    dto: GetEducationTermDto,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );
    const education = await this.educationDomainService.findEducationModelById(
      church,
      educationId,
      qr,
    );

    return this.educationTermDomainService.findEducationTerms(
      church,
      education,
      dto,
      qr,
    );
    /*const educationTermsRepository = this.getEducationTermsRepository(qr);

    const [result, totalCount] = await Promise.all([
      educationTermsRepository.find({
        where: {
          education: {
            churchId,
          },
          educationId: educationId,
        },
        order: {
          [dto.order]: dto.orderDirection,
          createdAt:
            dto.order === EducationTermOrderEnum.createdAt ? undefined : 'desc',
        },
        relations: {
          instructor: {
            officer: true,
            group: true,
            groupRole: true,
          },
        },
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),
      educationTermsRepository.count({
        where: {
          education: {
            churchId,
          },
          educationId,
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

  async getEducationTermById(
    churchId: number,
    educationId: number,
    educationTermId: number,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );
    const education = await this.educationDomainService.findEducationModelById(
      church,
      educationId,
      qr,
    );

    return this.educationTermDomainService.findEducationTermById(
      church,
      education,
      educationTermId,
      qr,
    );

    /*const educationTermsRepository = this.getEducationTermsRepository(qr);

    const educationTerm = await educationTermsRepository.findOne({
      where: {
        id: educationTermId,
        educationId,
        education: {
          churchId,
        },
      },
      relations: {
        instructor: {
          group: true,
          groupRole: true,
          officer: true,
        },
        /!*educationEnrollments: {
          member: {
            group: true,
            groupRole: true,
            officer: true,
          },
        },*!/
        educationSessions: true,
      },
    });

    if (!educationTerm) {
      throw new NotFoundException('해당 교육 기수를 찾을 수 없습니다.');
    }

    return educationTerm;*/
  }

  /*async getEducationTermModelById(
    churchId: number,
    educationId: number,
    educationTermId: number,
    qr?: QueryRunner,
    relations?: FindOptionsRelations<EducationTermModel>,
  ) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const educationTerm = await educationTermsRepository.findOne({
      where: {
        id: educationTermId,
        educationId,
        education: {
          churchId,
        },
      },
      relations: {
        //instructor: true,
        educationSessions: true,
        ...relations,
      },
    });

    if (!educationTerm) {
      throw new NotFoundException('해당 교육 기수를 찾을 수 없습니다.');
    }

    return educationTerm;
  }*/

  /*async isExistEducationTerm(
    educationId: number,
    term: number,
    qr?: QueryRunner,
  ) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const educationTerm = await educationTermsRepository.findOne({
      where: {
        educationId,
        term,
      },
    });

    return !!educationTerm;
  }*/

  async createEducationTerm(
    churchId: number,
    educationId: number,
    dto: CreateEducationTermDto,
    qr: QueryRunner,
  ) {
    /*const educationTermsRepository = this.getEducationTermsRepository(qr);

    const education = await this.educationTermSyncService.getEducationModelById(
      churchId,
      educationId,
      qr,
    );

    const instructor = dto.instructorId
      ? await this.membersService.getMemberModelById(
          churchId,
          dto.instructorId,
          {},
          qr,
        )
      : undefined;

    const isExistEducationTerm = await this.isExistEducationTerm(
      educationId,
      dto.term,
      qr,
    );

    if (isExistEducationTerm) {
      throw new BadRequestException('이미 존재하는 교육 기수입니다.');
    }

    const educationTerm = await educationTermsRepository.save({
      educationId,
      educationName: education.name,
      term: dto.term, //newTerm,
      numberOfSessions: dto.numberOfSessions,
      completionCriteria: dto.completionCriteria,
      startDate: dto.startDate,
      endDate: dto.endDate,
      instructor,
    });*/

    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const education = await this.educationDomainService.findEducationModelById(
      church,
      educationId,
      qr,
    );

    const instructor = dto.instructorId
      ? await this.membersService.getMemberModelById(
          church.id,
          dto.instructorId,
          {},
          qr,
        )
      : null;

    const educationTerm =
      await this.educationTermDomainService.createEducationTerm(
        church,
        education,
        instructor,
        dto,
        qr,
      );

    // 회차에 맞게 EducationSession 생성
    await this.educationSessionDomainService.createEducationSessions(
      educationTerm,
      educationTerm.numberOfSessions,
      qr,
    );
    /*await this.educationTermSessionSyncService.createEducationSessions(
      educationTerm.id,
      educationTerm.numberOfSessions,
      qr,
    );*/

    return educationTerm;
  }

  /*private validateUpdateEducationTerm(
    dto: UpdateEducationTermDto,
    educationTerm: EducationTermModel,
  ) {
    // 회자만 수정
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

    // 이수 조건만 수정
    if (dto.completionCriteria && !dto.numberOfSessions) {
      if (dto.completionCriteria > educationTerm.numberOfSessions) {
        throw new BadRequestException(
          '이수 조건은 교육 회차보다 작거나 같아야합니다.',
        );
      }
    }

    // 시작일만 수정
    if (dto.startDate && !dto.endDate) {
      if (dto.startDate > educationTerm.endDate) {
        throw new BadRequestException(
          '교육 시작일은 종료일보다 뒤일 수 없습니다.',
        );
      }
    }

    // 종료일만 수정
    if (dto.endDate && !dto.startDate) {
      if (educationTerm.startDate > dto.endDate) {
        throw new BadRequestException(
          '교육 종료일은 시작일보다 앞설 수 없습니다.',
        );
      }
    }
  }*/

  async updateEducationTerm(
    churchId: number,
    educationId: number,
    educationTermId: number,
    dto: UpdateEducationTermDto,
    qr: QueryRunner,
  ) {
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

    /*const educationTermsRepository = this.getEducationTermsRepository(qr);

    const educationTerm = await this.getEducationTermModelById(
        churchId,
        educationId,
        educationTermId,
        qr,
        { educationEnrollments: true },
    );

    this.validateUpdateEducationTerm(dto, educationTerm);

    const instructor = dto.instructorId
      ? await this.membersService.getMemberModelById(
          churchId,
          dto.instructorId,
          {},
          qr,
        )
      : undefined;

    if (dto.term) {
      const isExistEducationTerm = await this.isExistEducationTerm(
        educationId,
        dto.term,
        qr,
      );

      if (isExistEducationTerm) {
        throw new BadRequestException('이미 존재하는 교육 기수입니다.');
      }
    }



    await educationTermsRepository.update(
      {
        id: educationTermId,
      },
      {
        ...dto,
        instructor: instructor,
      },
    );

    return educationTermsRepository.findOne({ where: { id: educationTermId } });*/

    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );
    const education = await this.educationDomainService.findEducationModelById(
      church,
      educationId,
      qr,
    );
    const educationTerm =
      await this.educationTermDomainService.findEducationTermModelById(
        church,
        education,
        educationTermId,
        qr,
        { educationEnrollments: true, educationSessions: true },
      );
    const newInstructor = dto.instructorId
      ? await this.membersService.getMemberModelById(
          churchId,
          dto.instructorId,
          {},
          qr,
        )
      : null;

    const updatedEducationTerm =
      await this.educationTermDomainService.updateEducationTerm(
        education,
        educationTerm,
        newInstructor,
        dto,
        qr,
      );

    // 회차 수정 시
    // 회차 감소 --> 회차 삭제 X, 수동 삭제
    // 회차 증가 --> 회차 생성
    if (
      dto.numberOfSessions &&
      dto.numberOfSessions > educationTerm.educationSessions.length
    ) {
      // dto: 8, term: 5 --> session 6, 7, 8 생성
      const newSessions =
        await this.educationSessionDomainService.createAdditionalSessions(
          educationTerm,
          dto.numberOfSessions,
          qr,
        );
      /*await this.educationTermSessionSyncService.createAdditionalSessions(
          educationTerm,
          dto,
          qr,
        );*/

      // 증가된 세션에 대한 출석 정보 생성
      const newSessionIds = newSessions.map((newSession) => newSession.id);
      const enrollmentIds = educationTerm.educationEnrollments.map(
        (enrollment) => enrollment.id,
      );

      await this.educationTermAttendanceSyncService.createAdditionalSessionAttendance(
        newSessionIds,
        enrollmentIds,
        qr,
      );
    }

    return updatedEducationTerm;
  }

  async deleteEducationTerm(
    churchId: number,
    educationId: number,
    educationTermId: number,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );
    const education = await this.educationDomainService.findEducationModelById(
      church,
      educationId,
      qr,
    );

    const educationTerm =
      await this.educationTermDomainService.findEducationTermModelById(
        church,
        education,
        educationTermId,
        qr,
        {},
      );

    // 기수의 세션들 삭제
    await this.educationSessionDomainService.deleteEducationSessionCasCade(
      educationTerm,
      qr,
    );

    return await this.educationTermDomainService.deleteEducationTerm(
      educationTerm,
      qr,
    );

    /*const educationTermsRepository = this.getEducationTermsRepository(qr);

    const result = await educationTermsRepository.softDelete({
      educationId,
      id: educationTermId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('해당 교육 기수를 찾을 수 없습니다.');
    }

    return `educationTermId: ${educationTermId} deleted`;*/
  }

  async syncSessionAttendances(
    churchId: number,
    educationId: number,
    educationTermId: number,
    qr: QueryRunner,
  ) {
    return this.educationTermAttendanceSyncService.syncSessionAttendances(
      churchId,
      educationId,
      educationTermId,
      qr,
    );
  }
}
