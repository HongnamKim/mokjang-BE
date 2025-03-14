import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EducationSessionModel } from '../../entity/education/education-session.entity';
import { MoreThan, QueryRunner, Repository } from 'typeorm';
import { SessionAttendanceModel } from '../../entity/education/session-attendance.entity';
import { UpdateEducationSessionDto } from '../../dto/education/sessions/update-education-session.dto';
import { EducationTermSessionSyncService } from '../education-sync/education-term-session-sync.service';
import { EducationEnrollmentSessionSyncService } from '../education-sync/education-enrollment-session-sync.service';

@Injectable()
export class EducationSessionService {
  constructor(
    @InjectRepository(EducationSessionModel)
    private readonly educationSessionsRepository: Repository<EducationSessionModel>,
    /*@InjectRepository(EducationTermModel)
    private readonly educationTermsRepository: Repository<EducationTermModel>,*/
    /*@InjectRepository(EducationEnrollmentModel)
    private readonly educationEnrollmentsRepository: Repository<EducationEnrollmentModel>,*/
    @InjectRepository(SessionAttendanceModel)
    private readonly sessionAttendanceRepository: Repository<SessionAttendanceModel>,

    private readonly educationTermSessionSyncService: EducationTermSessionSyncService,
    private readonly educationEnrollmentSessionSyncService: EducationEnrollmentSessionSyncService,
  ) {}

  private getEducationSessionsRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationSessionModel)
      : this.educationSessionsRepository;
  }

  /*private getEducationTermsRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationTermModel)
      : this.educationTermsRepository;
  }*/

  /*private getEducationEnrollmentsRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationEnrollmentModel)
      : this.educationEnrollmentsRepository;
  }*/

  private getSessionAttendanceRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(SessionAttendanceModel)
      : this.sessionAttendanceRepository;
  }

  async getEducationSessions(
    churchId: number,
    educationId: number,
    educationTermId: number,
  ) {
    const educationSessionsRepository = this.getEducationSessionsRepository();

    return educationSessionsRepository.find({
      where: {
        educationTerm: {
          educationId,
          education: {
            churchId,
          },
        },
        educationTermId,
      },
      order: {
        session: 'asc',
      },
    });
  }

  async getEducationSessionById(
    churchId: number,
    educationId: number,
    educationTermId: number,
    educationSessionId: number,
    qr?: QueryRunner,
  ) {
    const educationSessionsRepository = this.getEducationSessionsRepository(qr);

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

    return session;
  }

  async createSingleEducationSession(
    churchId: number,
    educationId: number,
    educationTermId: number,
    qr: QueryRunner,
  ) {
    //const educationTermsRepository = this.getEducationTermsRepository(qr);
    const educationSessionsRepository = this.getEducationSessionsRepository(qr);

    const educationTerm =
      await this.educationTermSessionSyncService.getEducationTermModelById(
        educationId,
        educationTermId,
        qr,
      );

    /*const educationTerm = await educationTermsRepository.findOne({
      where: {
        id: educationTermId,
        educationId,
      },
      relations: {
        educationEnrollments: true,
      },
    });

    if (!educationTerm) {
      throw new NotFoundException('해당 교육 기수를 찾을 수 없습니다.');
    }*/

    const lastSession = await educationSessionsRepository.findOne({
      where: {
        educationTermId: educationTermId,
      },
      order: {
        session: 'desc',
      },
    });

    const newSessionNumber = lastSession ? lastSession.session + 1 : 1;

    // 교육 세션 생성
    const newSession = await educationSessionsRepository.save({
      session: newSessionNumber,
      educationTermId,
    });

    await Promise.all([
      // 교육 세션 개수 업데이트
      this.educationTermSessionSyncService.incrementNumberOfSessions(
        educationTermId,
        qr,
      ),
      /*educationTermsRepository.increment(
        { id: educationTermId },
        'numberOfSessions',
        1,
      ),*/
      // 세션 출석 정보 생성
      this.getSessionAttendanceRepository(qr).save(
        educationTerm.educationEnrollments.map((enrollment) => ({
          educationSessionId: newSession.id,
          educationEnrollmentId: enrollment.id,
        })),
      ),
    ]);

    return this.getEducationSessionById(
      churchId,
      educationId,
      educationTermId,
      newSession.id,
      qr,
    );
  }

  async updateEducationSession(
    churchId: number,
    educationId: number,
    educationTermId: number,
    educationSessionId: number,
    dto: UpdateEducationSessionDto,
    qr: QueryRunner,
  ) {
    const educationSessionsRepository = this.getEducationSessionsRepository(qr);
    //const educationTermsRepository = this.getEducationTermsRepository(qr);

    const targetSession = await this.getEducationSessionById(
      churchId,
      educationId,
      educationTermId,
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
        //console.log('isDoneCount 증가');
        //await this.incrementIsDoneCount(educationTermId, qr);
        /*await educationTermsRepository.increment(
          { id: educationTermId },
          'isDoneCount',
          1,
        );*/
        await this.educationTermSessionSyncService.increaseDoneCount(
          educationTermId,
          qr,
        );
      } else if (!dto.isDone) {
        //console.log('isDoneCount 감소');
        //await this.decrementIsDoneCount(educationTermId, qr);
        /*await educationTermsRepository.decrement(
          { id: educationTermId },
          'isDoneCount',
          1,
        );*/
        await this.educationTermSessionSyncService.decreaseDoneCount(
          educationTermId,
          qr,
        );
      }
    }

    /*
    기존 session 의 isDone 이 false
    --> dto.isDone = true -> isDoneCount 증가
    --> dto.isDone = false --> isDoneCount 변화 X
     */

    const result = await educationSessionsRepository.update(
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
    });
  }

  async deleteEducationSessions(
    churchId: number,
    educationId: number,
    educationTermId: number,
    educationSessionId: number,
    qr: QueryRunner,
  ) {
    const educationSessionsRepository = this.getEducationSessionsRepository(qr);

    const targetSession = await this.getEducationSessionById(
      churchId,
      educationId,
      educationTermId,
      educationSessionId,
      qr,
    );

    // 세션 삭제
    await educationSessionsRepository.softDelete({
      id: educationSessionId,
      educationTermId,
    });

    //const educationTermsRepository = this.getEducationTermsRepository(qr);

    // 다른 회차들 session 번호 수정
    await educationSessionsRepository.decrement(
      { educationTermId, session: MoreThan(targetSession.session) },
      'session',
      1,
    );

    // 해당 기수의 세션 개수 업데이트
    await this.educationTermSessionSyncService.decreaseSessionCount(
      educationTermId,
      qr,
    );
    /*await educationTermsRepository.decrement(
      { id: educationTermId },
      'numberOfSessions',
      1,
    );*/

    if (targetSession.isDone) {
      await this.educationTermSessionSyncService.decreaseDoneCount(
        educationTermId,
        qr,
      );
      /*await educationTermsRepository.decrement(
        { id: educationTermId },
        'isDoneCount',
        1,
      );*/
      //await this.decrementIsDoneCount(educationTermId, qr);
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

    /*
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    await educationEnrollmentsRepository.decrement(
      { id: In(attendedEnrollmentIds) },
      'attendanceCount',
      1,
    );*/

    return `educationSessionId: ${educationSessionId} deleted`;
  }
}
