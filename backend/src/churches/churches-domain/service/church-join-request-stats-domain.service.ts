import { BadRequestException, Injectable } from '@nestjs/common';
import { IChurchJoinRequestStatsDomainService } from '../interface/church-join-request-stats-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { ChurchJoinRequestStatModel } from '../../entity/church-join-request-stat.entity';
import { QueryRunner, Repository } from 'typeorm';
import { UserModel } from '../../../user/entity/user.entity';
import { ChurchJoinRequestException } from '../../const/exception/church.exception';
import { ChurchJoinRequestConstraints } from '../../const/church-join-request.constraints';

@Injectable()
export class ChurchJoinRequestStatsDomainService
  implements IChurchJoinRequestStatsDomainService
{
  constructor(
    @InjectRepository(ChurchJoinRequestStatModel)
    private readonly repository: Repository<ChurchJoinRequestStatModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(ChurchJoinRequestStatModel)
      : this.repository;
  }

  async increaseAttemptsCount(user: UserModel, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    const today = new Date().toISOString().split('T')[0];

    let stat = await repository.findOne({
      where: { userId: user.id, date: today },
    });

    if (!stat) {
      stat = repository.create({ userId: user.id, date: today, attempts: 1 });
    } else {
      if (stat.attempts >= 5) {
        throw new BadRequestException(
          ChurchJoinRequestException.TOO_MANY_REQUESTS(
            ChurchJoinRequestConstraints.MAX_ATTEMPTS,
          ),
        );
      }

      stat.attempts += 1;
    }

    await repository.save(stat);
  }

  async getTopRequestUsers() {
    return this.repository
      .createQueryBuilder('stat')
      .leftJoin('stat.user', 'user')
      .select('stat.userId', 'userId')
      .addSelect('SUM(stat.attempts)', 'totalAttempts')
      .where("stat.date >= CURRENT_DATE - INTERVAL '7 days'")
      .groupBy('stat.userId')
      .orderBy('"totalAttempts"', 'DESC')
      .limit(10)
      .getRawMany();
  }
}
