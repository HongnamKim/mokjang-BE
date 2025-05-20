import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IEducationSessionReportDomainService } from '../interface/education-session-report-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { EducationSessionReportModel } from '../../entity/education-session-report.entity';
import { QueryRunner, Repository } from 'typeorm';
import { MemberModel } from '../../../members/entity/member.entity';
import { EducationSessionReportException } from '../../const/exception/education-session-report.exception';
import { EducationModel } from '../../../management/educations/entity/education.entity';
import { EducationTermModel } from '../../../management/educations/entity/education-term.entity';
import { EducationSessionModel } from '../../../management/educations/entity/education-session.entity';
import { MAX_RECEIVER_COUNT } from '../../const/report.constraints';
import { MemberException } from '../../../members/const/exception/member.exception';
import { UserRole } from '../../../user/const/user-role.enum';
import { AddConflictExceptionV2 } from '../../../common/exception/add-conflict.exception';

@Injectable()
export class EducationSessionReportDomainService
  implements IEducationSessionReportDomainService
{
  constructor(
    @InjectRepository(EducationSessionReportModel)
    private readonly repository: Repository<EducationSessionReportModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationSessionReportModel)
      : this.repository;
  }

  private assertCanAddReceivers(
    educationSession: EducationSessionModel & {
      reports: EducationSessionReportModel[];
    },
    newReceiverIds: number[] | MemberModel[],
  ) {
    let reports = educationSession.reports;

    if (reports === undefined) {
      throw new InternalServerErrorException(
        EducationSessionReportException.REPORT_LOAD_FAIL,
      );
    }

    if (reports.length + newReceiverIds.length > MAX_RECEIVER_COUNT) {
      throw new ConflictException(
        EducationSessionReportException.EXCEED_RECEIVERS(),
      );
    }
  }

  async createSingleReport(
    education: EducationModel,
    educationTerm: EducationTermModel,
    educationSession: EducationSessionModel,
    receiver: MemberModel,
    qr: QueryRunner,
  ) {
    // 해당 교육에 피보고자 추가할 수 있는지
    //educationSession.canAddReport([receiver]);
    this.assertCanAddReceivers(educationSession, [receiver]);

    if (!receiver.userId) {
      throw new ConflictException('계정 가입되지 않음');
    } else if (!receiver.user) {
      throw new InternalServerErrorException('계정 정보 불러오기 실패');
    } else if (
      receiver.user.role !== UserRole.manager &&
      receiver.user.role !== UserRole.mainAdmin
    ) {
      throw new ConflictException('관리자가 아님');
    }

    const repository = this.getRepository(qr);

    const isExist = await repository.findOne({
      where: {
        receiverId: receiver.id,
        educationSessionId: educationSession.id,
      },
    });

    if (isExist) {
      throw new ConflictException('이미 존재하는 피보고자');
    }

    return repository.save({
      receiverId: receiver.id,
      educationSessionId: educationSession.id,
      educationTermId: educationTerm.id,
      educationId: education.id,
    });
  }

  async createEducationSessionReports(
    education: EducationModel,
    educationTerm: EducationTermModel,
    educationSession: EducationSessionModel,
    receivers: MemberModel[],
    qr: QueryRunner,
  ) {
    educationSession.canAddReport(receivers);

    const repository = this.getRepository(qr);

    const failed: { receiverId: number; reason: string }[] = [];

    const oldReceiverIds = new Set(
      educationSession.reports.map((r) => r.receiverId),
    );

    for (const receiver of receivers) {
      // 피보고자 중복 등록
      if (oldReceiverIds.has(receiver.id)) {
        failed.push({
          receiverId: receiver.id,
          reason: '이미 피보고자로 지정된 교인입니다.',
        });
      }

      // 피보고자의 가입 여부
      if (!receiver.userId) {
        failed.push({
          receiverId: receiver.id,
          reason: '계정 가입되지 않은 교인입니다.',
        });
      }

      if (!receiver.user) {
        throw new InternalServerErrorException(MemberException.USER_ERROR);
      }

      if (
        receiver.user.role !== UserRole.mainAdmin &&
        receiver.user.role !== UserRole.manager
      ) {
        failed.push({
          receiverId: receiver.id,
          reason: '관리자 권한의 교인만 피보고자로 등록 가능',
        });
      }
    }

    if (failed.length > 0) {
      throw new AddConflictExceptionV2('피보고자 추가 실패', failed);
    }

    const reports = receivers.map((receiver) =>
      repository.create({
        educationId: education.id,
        educationTermId: educationTerm.id,
        educationSession: educationSession,
        receiver,
        reportedAt: new Date(),
        isRead: false,
        isConfirmed: false,
      }),
    );

    return repository.save(reports);
  }

  async findEducationSessionReportById(
    receiver: MemberModel,
    reportId: number,
    checkIsRead: boolean,
    qr?: QueryRunner,
  ): Promise<EducationSessionReportModel> {
    const repository = this.getRepository(qr);

    const report = await repository.findOne({
      where: {
        receiverId: receiver.id,
        id: reportId,
      },
    });

    if (!report) {
      throw new NotFoundException(EducationSessionReportException.NOT_FOUND);
    }

    // 읽음 처리
    if (checkIsRead) {
      report.isRead = true;
      await repository.save(report);
    }

    return report;
  }
}
