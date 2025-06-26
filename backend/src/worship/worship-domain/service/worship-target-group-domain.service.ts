import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { IWorshipTargetGroupDomainService } from '../interface/worship-target-group-domain.service.interface';
import { WorshipModel } from '../../entity/worship.entity';
import { WorshipTargetGroupModel } from '../../entity/worship-target-group.entity';
import { DeleteResult, In, QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupModel } from '../../../management/groups/entity/group.entity';

@Injectable()
export class WorshipTargetGroupDomainService
  implements IWorshipTargetGroupDomainService
{
  constructor(
    @InjectRepository(WorshipTargetGroupModel)
    private readonly repository: Repository<WorshipTargetGroupModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(WorshipTargetGroupModel)
      : this.repository;
  }

  createWorshipTargetGroup(
    worship: WorshipModel,
    targetGroups: GroupModel[],
    qr?: QueryRunner,
  ): Promise<WorshipTargetGroupModel[]> {
    const repository = this.getRepository(qr);

    const worshipTargetGroups = repository.create(
      targetGroups.map((targetGroup) => ({
        worshipId: worship.id,
        groupId: targetGroup.id,
      })),
    );

    return repository.save(worshipTargetGroups);
  }

  async deleteWorshipTargetGroup(
    worship: WorshipModel,
    targetGroupIds: number[],
    qr?: QueryRunner,
  ): Promise<DeleteResult> {
    const repository = this.getRepository(qr);

    const result = await repository.delete({
      worshipId: worship.id,
      groupId: In(targetGroupIds),
    });

    if (result.affected === 0) {
      throw new InternalServerErrorException();
    }

    if (result.affected !== targetGroupIds.length) {
      throw new BadRequestException();
    }

    return result;
  }

  async deleteWorshipTargetGroupCascade(
    targetWorship: WorshipModel,
    qr: QueryRunner,
  ): Promise<DeleteResult> {
    const repository = this.getRepository(qr);

    return repository.delete({
      worshipId: targetWorship.id,
    });
  }
}
