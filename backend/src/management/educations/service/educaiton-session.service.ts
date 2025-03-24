import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { SessionAttendanceModel } from '../../entity/education/session-attendance.entity';
import { UpdateEducationSessionDto } from '../dto/sessions/update-education-session.dto';
import { EducationEnrollmentSessionSyncService } from './sync/education-enrollment-session-sync.service';
import {
  IEDUCATION_SESSION_DOMAIN_SERVICE,
  IEducationSessionDomainService,
} from './education-domain/interface/education-session-domain.service.interface';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IEDUCATION_DOMAIN_SERVICE,
  IEducationDomainService,
} from './education-domain/interface/education-domain.service.interface';
import {
  IEDUCATION_TERM_DOMAIN_SERVICE,
  IEducationTermDomainService,
} from './education-domain/interface/education-term-domain.service.interface';

@Injectable()
export class EducationSessionService {
  constructor(
    /*@InjectRepository(EducationSessionModel)
    private readonly educationSessionsRepository: Repository<EducationSessionModel>,*/

    @InjectRepository(SessionAttendanceModel)
    private readonly sessionAttendanceRepository: Repository<SessionAttendanceModel>,

    //private readonly educationTermSessionSyncService: EducationTermSessionSyncService,
    private readonly educationEnrollmentSessionSyncService: EducationEnrollmentSessionSyncService,

    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IEDUCATION_DOMAIN_SERVICE)
    private readonly educationDomainService: IEducationDomainService,
    @Inject(IEDUCATION_TERM_DOMAIN_SERVICE)
    private readonly educationTermDomainService: IEducationTermDomainService,
    @Inject(IEDUCATION_SESSION_DOMAIN_SERVICE)
    private readonly educationSessionDomainService: IEducationSessionDomainService,
  ) {}

  /*private getEducationSessionsRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationSessionModel)
      : this.educationSessionsRepository;
  }*/

  private getSessionAttendanceRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(SessionAttendanceModel)
      : this.sessionAttendanceRepository;
  }

  private async getEducationTerm(
    churchId: number,
    educationId: number,
    educationTermId: number,
    qr?: QueryRunner,
  ) {
    const { church, education } = await this.getEducationInfo(
      churchId,
      educationId,
      qr,
    );

    return this.educationTermDomainService.findEducationTermModelById(
      church,
      education,
      educationTermId,
      qr,
    );
  }

  private async getEducationInfo(
    churchId: number,
    educationId: number,
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

    return {
      church,
      education,
    };
  }

  async getEducationSessions(
    churchId: number,
    educationId: number,
    educationTermId: number,
  ) {
    const educationTerm = await this.getEducationTerm(
      churchId,
      educationId,
      educationTermId,
    );

    return this.educationSessionDomainService.findEducationSessions(
      educationTerm,
    );
  }

  async getEducationSessionById(
    churchId: number,
    educationId: number,
    educationTermId: number,
    educationSessionId: number,
    qr?: QueryRunner,
  ) {
    const educationTerm = await this.getEducationTerm(
      churchId,
      educationId,
      educationTermId,
      qr,
    );

    return this.educationSessionDomainService.findEducationSessionById(
      educationTerm,
      educationSessionId,
      qr,
    );
    /*const educationSessionsRepository = this.getEducationSessionsRepository(qr);

    const session = await educationSessionsRepository.findOne({
      where: {
        id: educationSessionId,
        educationTermId,
        educationTerm: {
          educationId,
          education: {
            churchId,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('해당 교육 세션을 찾을 수 없습니다.');
    }

    return session;*/
  }

  async createSingleEducationSession(
    churchId: number,
    educationId: number,
    educationTermId: number,
    qr: QueryRunner,
  ) {
    const { church, education } = await this.getEducationInfo(
      churchId,
      educationId,
    );

    const educationTerm =
      await this.educationTermDomainService.findEducationTermModelById(
        church,
        education,
        educationTermId,
        qr,
        { educationEnrollments: true },
      );

    /*const educationTerm =
      await this.educationTermSessionSyncService.getEducationTermModelById(
        educationId,
        educationTermId,
        qr,
      );*/

    /*const lastSession = await educationSessionsRepository.findOne({
      where: {
        educationTermId: educationTermId,
      },
      order: {
        session: 'desc',
      },
    });*/

    //const newSessionNumber = lastSession ? lastSession.session + 1 : 1;

    // 교육 세션 생성
    /*const newSession = await educationSessionsRepository.save({
      session: newSessionNumber,
      educationTermId,
    });*/

    const newSession =
      await this.educationSessionDomainService.createSingleEducationSession(
        educationTerm,
        qr,
      );

    await Promise.all([
      // 교육 세션 개수 업데이트
      this.educationTermDomainService.incrementNumberOfSessions(
        educationTerm,
        qr,
      ),
      /*this.educationTermSessionSyncService.incrementNumberOfSessions(
        educationTermId,
        qr,
      ),*/

      // 세션 출석 정보 생성
      this.getSessionAttendanceRepository(qr).save(
        educationTerm.educationEnrollments.map((enrollment) => ({
          educationSessionId: newSession.id,
          educationEnrollmentId: enrollment.id,
        })),
      ),
    ]);

    return this.educationSessionDomainService.findEducationSessionById(
      educationTerm,
      newSession.id,
      qr,
    );
    /*return this.getEducationSessionById(
      churchId,
      educationId,
      educationTermId,
      newSession.id,
      qr,
    );*/
  }

  async updateEducationSession(
    churchId: number,
    educationId: number,
    educationTermId: number,
    educationSessionId: number,
    dto: UpdateEducationSessionDto,
    qr: QueryRunner,
  ) {
    /*const educationSessionsRepository = this.getEducationSessionsRepository(qr);

    const targetSession = await this.getEducationSessionById(
      churchId,
      educationId,
      educationTermId,
      educationSessionId,
      qr,
    );*/

    const educationTerm = await this.getEducationTerm(
      churchId,
      educationId,
      educationTermId,
      qr,
    );

    const targetSession =
      await this.educationSessionDomainService.findEducationSessionById(
        educationTerm,
        educationSessionId,
        qr,
      );

    /*
    기존 session 의 isDone 이 true
    --> dto.isDone = true -> isDoneCount 변화 X
    --> dto.isDone = false -> isDoneCount 감소
    */
    if (dto.isDone !== undefined && dto.isDone !== targetSession.isDone) {
      if (dto.isDone) {
        await this.educationTermDomainService.incrementDoneCount(
          educationTerm,
          qr,
        );
        /*await this.educationTermSessionSyncService.increaseDoneCount(
          educationTermId,
          qr,
        );*/
      } else if (!dto.isDone) {
        await this.educationTermDomainService.decrementDoneCount(
          educationTerm,
          qr,
        );
        /*await this.educationTermSessionSyncService.decreaseDoneCount(
          educationTermId,
          qr,
        );*/
      }
    }

    return this.educationSessionDomainService.updateEducationSession(
      targetSession,
      dto,
      qr,
    );

    /*const result = await educationSessionsRepository.update(
      {
        id: targetSession.id,
      },
      {
        content: dto.content,
        sessionDate: dto.sessionDate,
        isDone: dto.isDone,
      },
    );

    if (result.affected === 0) {
      throw new NotFoundException('해당 교육 회차를 찾을 수 없습니다.');
    }

    return educationSessionsRepository.findOne({
      where: { id: educationSessionId },
    });*/
  }

  async deleteEducationSessions(
    churchId: number,
    educationId: number,
    educationTermId: number,
    educationSessionId: number,
    qr: QueryRunner,
  ) {
    /*const educationSessionsRepository = this.getEducationSessionsRepository(qr);

    const targetSession = await this.getEducationSessionById(
      churchId,
      educationId,
      educationTermId,
      educationSessionId,
      qr,
    );*/

    const educationTerm = await this.getEducationTerm(
      churchId,
      educationId,
      educationTermId,
      qr,
    );

    const targetSession =
      await this.educationSessionDomainService.findEducationSessionById(
        educationTerm,
        educationSessionId,
        qr,
      );

    // 세션 삭제
    await this.educationSessionDomainService.deleteEducationSession(
      targetSession,
      qr,
    );

    // 다른 회차들 session 번호 수정
    await this.educationSessionDomainService.reorderSessionsAfterDeletion(
      educationTerm,
      targetSession,
      qr,
    );
    /*await educationSessionsRepository.decrement(
      { educationTermId, session: MoreThan(targetSession.session) },
      'session',
      1,
    );*/

    // 해당 기수의 세션 개수 업데이트
    await this.educationTermDomainService.decrementNumberOfSessions(
      educationTerm,
      qr,
    );
    /*await this.educationTermSessionSyncService.decreaseSessionCount(
      educationTermId,
      qr,
    );*/

    if (targetSession.isDone) {
      await this.educationTermDomainService.decrementDoneCount(
        educationTerm,
        qr,
      );
      /*await this.educationTermSessionSyncService.decreaseDoneCount(
        educationTermId,
        qr,
      );*/
    }

    // 해당 세션 하위의 출석 정보 삭제
    const sessionAttendanceRepository = this.getSessionAttendanceRepository(qr);

    const attendances = await sessionAttendanceRepository.find({
      where: {
        educationSessionId,
      },
    });

    // 삭제할 세션에 출석한 교육 대상자 ID
    const attendedEnrollmentIds = attendances
      .filter((attendance) => attendance.isPresent)
      .map((attendance) => attendance.educationEnrollmentId);

    // 해당 세션의 출석 정보 삭제
    await sessionAttendanceRepository.softDelete({
      educationSessionId: educationSessionId,
    });

    await this.educationEnrollmentSessionSyncService.decreaseAttendanceCount(
      attendedEnrollmentIds,
      qr,
    );

    return `educationSessionId: ${educationSessionId} deleted`;
  }
}
