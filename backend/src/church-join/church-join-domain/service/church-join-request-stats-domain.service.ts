import { BadRequestException, Injectable } from '@nestjs/common';
import { IChurchJoinRequestStatsDomainService } from '../interface/church-join-request-stats-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { ChurchJoinStatModel } from '../../entity/church-join-stat.entity';
import { QueryRunner, Repository } from 'typeorm';
import { UserModel } from '../../../user/entity/user.entity';
import { ChurchJoinRequestConstraints } from '../../const/church-join-request.constraints';
import { ChurchJoinException } from '../../exception/church-join.exception';

@Injectable()
export class ChurchJoinRequestStatsDomainService
  implements IChurchJoinRequestStatsDomainService
{
  constructor(
    @InjectRepository(ChurchJoinStatModel)
    private readonly repository: Repository<ChurchJoinStatModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(ChurchJoinStatModel) : this.repository;
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
          ChurchJoinException.TOO_MANY_REQUESTS(
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
