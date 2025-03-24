import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EducationTermModel } from '../../../../entity/education/education-term.entity';
import { QueryRunner, Repository } from 'typeorm';
import { EducationSessionModel } from '../../../../entity/education/education-session.entity';
import { UpdateEducationTermDto } from '../../../dto/terms/update-education-term.dto';

//@Injectable()
/*export*/ class EducationTermSessionSyncService {
  constructor(
    @InjectRepository(EducationTermModel)
    private readonly educationTermRepository: Repository<EducationTermModel>,
    @InjectRepository(EducationSessionModel)
    private readonly educationSessionRepository: Repository<EducationSessionModel>,
  ) {}

  private getEducationTermRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationTermModel)
      : this.educationTermRepository;
  }

  private getEducationSessionRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationSessionModel)
      : this.educationSessionRepository;
  }

  async increaseDoneCount(educationTermId: number, qr: QueryRunner) {
    const educationTermRepository = this.getEducationTermRepository(qr);

    return educationTermRepository.increment(
      { id: educationTermId },
      'isDoneCount',
      1,
    );
  }

  async decreaseDoneCount(educationTermId: number, qr: QueryRunner) {
    const educationTermRepository = this.getEducationTermRepository(qr);

    return educationTermRepository.decrement(
      { id: educationTermId },
      'isDoneCount',
      1,
    );
  }

  async decreaseSessionCount(educationTermId: number, qr: QueryRunner) {
    const educationTermRepository = this.getEducationTermRepository(qr);

    return educationTermRepository.decrement(
      { id: educationTermId },
      'numberOfSessions',
      1,
    );
  }

  async getEducationTermModelById(
    educationId: number,
    educationTermId: number,
    qr: QueryRunner,
  ) {
    const educationTermsRepository = this.getEducationTermRepository(qr);

    const educationTerm = await educationTermsRepository.findOne({
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
    }

    return educationTerm;
  }

  async createEducationSessions(
    educationTermId: number,
    numberOfSessions: number,
    qr: QueryRunner,
  ) {
    const educationSessionsRepository = this.getEducationSessionRepository(qr);

    await educationSessionsRepository.save(
      Array.from({ length: numberOfSessions }, (_, i) => ({
        session: i + 1,
        educationTermId: educationTermId,
      })),
    );
  }

  async createAdditionalSessions(
    educationTerm: EducationTermModel,
    dto: UpdateEducationTermDto,
    qr: QueryRunner,
  ) {
    const educationSessionsRepository = this.getEducationSessionRepository(qr);

    return educationSessionsRepository.save(
      Array.from(
        {
          length: dto.numberOfSessions - educationTerm.educationSessions.length,
        },
        (_, index) => ({
          educationTermId: educationTerm.id,
          session: educationTerm.educationSessions.length + index + 1,
        }),
      ),
    );
  }

  incrementNumberOfSessions(educationTermId: number, qr: QueryRunner) {
    const educationTermsRepository = this.getEducationTermRepository(qr);
    return educationTermsRepository.increment(
      { id: educationTermId },
      'numberOfSessions',
      1,
    );
  }
}
