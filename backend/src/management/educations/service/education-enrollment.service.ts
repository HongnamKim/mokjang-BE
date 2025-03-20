import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EducationEnrollmentModel } from '../../entity/education/education-enrollment.entity';
import { QueryRunner, Repository } from 'typeorm';
import { GetEducationEnrollmentDto } from '../dto/enrollments/get-education-enrollment.dto';
import { EducationEnrollmentOrderEnum } from '../const/order.enum';
import { CreateEducationEnrollmentDto } from '../dto/enrollments/create-education-enrollment.dto';
import { UpdateEducationEnrollmentDto } from '../dto/enrollments/update-education-enrollment.dto';
import { EducationTermEnrollmentSyncService } from './sync/education-term-enrollment-sync.service';
import { EducationEnrollmentAttendanceSyncService } from './sync/education-enrollment-attendance-sync.service';
import { MembersService } from '../../../churches/members/service/members.service';

@Injectable()
export class EducationEnrollmentService {
  constructor(
    @InjectRepository(EducationEnrollmentModel)
    private readonly educationEnrollmentsRepository: Repository<EducationEnrollmentModel>,

    private readonly membersService: MembersService,
    private readonly educationTermEnrollmentSyncService: EducationTermEnrollmentSyncService,
    private readonly educationEnrollmentAttendanceSyncService: EducationEnrollmentAttendanceSyncService,
  ) {}

  private getEducationEnrollmentsRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationEnrollmentModel)
      : this.educationEnrollmentsRepository;
  }

  async getEducationEnrollments(
    churchId: number,
    educationId: number,
    educationTermId: number,
    dto: GetEducationEnrollmentDto,
    qr?: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    const [result, totalCount] = await Promise.all([
      educationEnrollmentsRepository.find({
        where: {
          educationTermId,
          educationTerm: {
            educationId,
            education: {
              churchId,
            },
          },
        },
        relations: {
          member: {
            group: true,
            groupRole: true,
            officer: true,
          },
        },
        order: {
          [dto.order]: dto.orderDirection,
          createdAt:
            dto.order === EducationEnrollmentOrderEnum.createdAt
              ? undefined
              : 'desc',
        },
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),
      educationEnrollmentsRepository.count({
        where: {
          educationTermId,
          educationTerm: {
            educationId,
            education: {
              churchId,
            },
          },
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

  async getMemberEducationEnrollments(
    memberId: number,
    churchId: number,
    qr?: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    const enrollments = await educationEnrollmentsRepository.find({
      where: {
        memberId,
        educationTerm: {
          education: {
            churchId,
          },
        },
      },
      relations: {
        educationTerm: true,
      },
    });

    return enrollments;
  }

  async getEducationEnrollmentModelById(
    educationEnrollmentId: number,
    qr?: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    const enrollment = await educationEnrollmentsRepository.findOne({
      where: {
        id: educationEnrollmentId,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('해당 교육 대상자 내역을 찾을 수 없습니다.');
    }

    return enrollment;
  }

  async getEducationEnrollmentById(
    churchId: number,
    educationId: number,
    educationTermId: number,
    educationEnrollmentId: number,
    qr?: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    const enrollment = await educationEnrollmentsRepository.findOne({
      where: {
        educationTerm: {
          educationId,
          education: {
            churchId,
          },
        },
        educationTermId,
        id: educationEnrollmentId,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('해당 교육 대상자 내역을 찾을 수 없습니다.');
    }

    return enrollment;
  }

  async isExistEnrollment(
    educationTermId: number,
    memberId: number,
    qr?: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    const enrollment = await educationEnrollmentsRepository.findOne({
      where: {
        educationTermId,
        memberId,
      },
    });

    return !!enrollment;
  }

  async createEducationEnrollment(
    churchId: number,
    educationId: number,
    educationTermId: number,
    dto: CreateEducationEnrollmentDto,
    qr: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository();

    const member = await this.membersService.getMemberModelById(
      churchId,
      dto.memberId,
      {},
      qr,
    );

    const [educationTerm, isExistEnrollment] = await Promise.all([
      this.educationTermEnrollmentSyncService.getEducationTermModelById(
        churchId,
        educationId,
        educationTermId,
        qr,
      ),

      this.isExistEnrollment(educationTermId, member.id, qr),
    ]);

    if (isExistEnrollment) {
      throw new BadRequestException('이미 교육 대상자로 등록된 교인입니다.');
    }

    // enrollment 생성
    const enrollment = await educationEnrollmentsRepository.save({
      member,
      educationTerm,
      status: dto.status,
      note: dto.note,
    });

    // 교육 등록 생성 후속 작업
    const educationSessionIds = educationTerm.educationSessions.map(
      (session) => session.id,
    );

    // 수강 대상 교인 수 증가 + 세션의 출석 정보 생성
    await Promise.all([
      // 교육 수강자 수 증가
      this.educationTermEnrollmentSyncService.incrementEnrollmentCount(
        educationTermId,
        qr,
      ),
      // 교육 수강자 상태 통계값 업데이트
      this.educationTermEnrollmentSyncService.incrementEducationStatusCount(
        educationTermId,
        dto.status,
        qr,
      ),
      // 수강자의 출석 정보 생성
      this.educationEnrollmentAttendanceSyncService.createSessionAttendanceForNewEnrollment(
        enrollment,
        educationSessionIds,
        qr,
      ),
    ]);

    return educationEnrollmentsRepository.findOne({
      where: {
        id: enrollment.id,
      },
      relations: {
        member: {
          group: true,
          groupRole: true,
          officer: true,
        },
      },
    });
  }

  async updateEducationEnrollment(
    churchId: number,
    educationId: number,
    educationTermId: number,
    educationEnrollmentId: number,
    dto: UpdateEducationEnrollmentDto,
    qr: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    const targetEducationEnrollment = await this.getEducationEnrollmentById(
      churchId,
      educationId,
      educationTermId,
      educationEnrollmentId,
      qr,
    );

    // 교육 이수 상태 변경 시 해당 기수의 이수자 통계 업데이트
    // 교육 이수 상태를 변경 && 기존 이수 상태와 다를 경우
    if (dto.status && dto.status !== targetEducationEnrollment.status) {
      await Promise.all([
        // 기존 status 감소
        this.educationTermEnrollmentSyncService.decrementEducationStatusCount(
          educationTermId,
          targetEducationEnrollment.status,
          qr,
        ),
        // 새 status 증가
        this.educationTermEnrollmentSyncService.incrementEducationStatusCount(
          educationTermId,
          dto.status,
          qr,
        ),
      ]);
    }

    // 교육등록 업데이트
    await educationEnrollmentsRepository.update(
      {
        id: educationEnrollmentId,
        educationTermId,
      },
      {
        status: dto.status,
        note: dto.note,
      },
    );

    return educationEnrollmentsRepository.findOne({
      where: {
        id: targetEducationEnrollment.id,
      },
      relations: {
        member: {
          group: true,
          groupRole: true,
          officer: true,
        },
      },
    });
  }

  async deleteEducationEnrollment(
    churchId: number,
    educationId: number,
    educationTermId: number,
    educationEnrollmentId: number,
    qr: QueryRunner,
    memberDeleted: boolean = false,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    const targetEnrollment = await this.getEducationEnrollmentById(
      churchId,
      educationId,
      educationTermId,
      educationEnrollmentId,
      qr,
    );

    const member = memberDeleted
      ? await this.membersService.getDeleteMemberModelById(
          churchId,
          targetEnrollment.memberId,
          { educations: true },
          qr,
        )
      : await this.membersService.getMemberModelById(
          churchId,
          targetEnrollment.memberId,
          { educations: true },
          qr,
        );

    await Promise.all([
      // 교인 - 교육 관계 해제
      this.membersService.endMemberEducation(member, educationEnrollmentId, qr),
      // 등록 인원 감소
      this.educationTermEnrollmentSyncService.decrementEnrollmentCount(
        educationTermId,
        qr,
      ),
      // 상태별 카운트 감소
      this.educationTermEnrollmentSyncService.decrementEducationStatusCount(
        educationTermId,
        targetEnrollment.status,
        qr,
      ),
      // 교육 등록 삭제
      educationEnrollmentsRepository.softDelete({
        id: educationEnrollmentId,
        educationTermId,
      }),
      // 출석 정보 삭제
      this.educationEnrollmentAttendanceSyncService.deleteSessionAttendanceByEnrollmentDeletion(
        educationEnrollmentId,
        qr,
      ),
    ]);

    return `educationEnrollment: ${educationEnrollmentId} deleted`;
  }
}
