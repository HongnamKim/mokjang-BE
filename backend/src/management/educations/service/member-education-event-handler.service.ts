import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { MemberDeletedEvent } from '../../../churches/members/events/member.event';
import { DataSource } from 'typeorm';
import { EducationEnrollmentService } from './education-enrollment.service';
import {
  IEDUCATION_ENROLLMENT_DOMAIN_SERVICE,
  IEducationEnrollmentsDomainService,
} from './education-domain/interface/education-enrollment-domain.service.interface';

@Injectable()
export class MemberEducationEventHandler {
  constructor(
    private readonly educationEnrollmentService: EducationEnrollmentService,
    private readonly eventEmitter: EventEmitter2,
    private readonly dataSource: DataSource,

    @Inject(IEDUCATION_ENROLLMENT_DOMAIN_SERVICE)
    private readonly educationEnrollmentDomainService: IEducationEnrollmentsDomainService,
  ) {}

  // 재시도 간격을 지수적으로 증가 (exponential backoff)
  private getRetryDelay(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt), 10000); // 최대 10초
  }

  @OnEvent('member.deleted', {})
  async handleMemberDeleted(event: MemberDeletedEvent) {
    const { churchId, memberId, attempt, maxAttempts } = event;

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();

    await qr.startTransaction();

    try {
      const enrollments =
        await this.educationEnrollmentDomainService.findMemberEducationEnrollments(
          memberId,
          qr,
        );
      /*await this.educationEnrollmentService.getMemberEducationEnrollments(
          event.memberId,
          event.churchId,
          qr,
        );*/

      await Promise.all(
        enrollments.map((enrollment) =>
          this.educationEnrollmentService.deleteEducationEnrollment(
            churchId,
            enrollment.educationTerm.educationId,
            enrollment.educationTermId,
            enrollment.id,
            qr,
            true,
          ),
        ),
      );

      await qr.commitTransaction();
      await qr.release();
      console.log(
        `Successfully processed member deletion for churchId: ${churchId}, memberId: ${memberId}`,
      );
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();

      console.error(
        `Failed to process member deletion. churchId: ${churchId}, memberId: ${memberId}, attempt: ${attempt}`,
        error.stack,
      );

      if (attempt < maxAttempts) {
        console.log(`Retrying... Attempt ${attempt + 1} of ${maxAttempts}`);

        // 일정 시간 후 재시도
        setTimeout(() => {
          this.eventEmitter.emit(
            'member.deleted',
            new MemberDeletedEvent(
              churchId,
              memberId,
              attempt + 1,
              maxAttempts,
            ),
          );
        }, this.getRetryDelay(attempt));
      } else {
        // 최대 시도 횟수 초과
        console.error(
          `Max retry attempts reached for member deletion. churchId: ${churchId}, memberId: ${memberId}`,
        );

        // 실패 처리 이벤트 발행
        /*this.eventEmitter.emit('member.deletion.failed', {
                churchId,
                memberId,
                error: error.message,
              });*/
      }
    }
  }
}
