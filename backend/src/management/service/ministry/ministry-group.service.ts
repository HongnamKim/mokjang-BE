import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MinistryGroupModel } from '../../entity/ministry/ministry-group.entity';
import { FindOptionsRelations, IsNull, QueryRunner, Repository } from 'typeorm';
import { CreateMinistryGroupDto } from '../../dto/ministry/create-ministry-group.dto';
import { UpdateMinistryGroupDto } from '../../dto/ministry/update-ministry-group.dto';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';

@Injectable()
export class MinistryGroupService {
  constructor(
    @InjectRepository(MinistryGroupModel)
    private readonly ministryGroupRepository: Repository<MinistryGroupModel>,

    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
  ) {}

  private getMinistryGroupRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(MinistryGroupModel)
      : this.ministryGroupRepository;
  }

  private async checkChurchExist(churchId: number, qr?: QueryRunner) {
    const isExistChurch = await this.churchesDomainService.isExistChurch(
      churchId,
      qr,
    );

    if (!isExistChurch) {
      throw new NotFoundException('해당 교회를 찾을 수 없습니다.');
    }
  }

  private async isExistMinistryGroup(
    churchId: number,
    parentMinistryGroupId: number | undefined,
    name: string,
    qr?: QueryRunner,
  ) {
    const ministryGroupsRepository = this.getMinistryGroupRepository(qr);

    const group = await ministryGroupsRepository.findOne({
      where: {
        churchId,
        parentMinistryGroupId: parentMinistryGroupId
          ? parentMinistryGroupId
          : IsNull(),
        name,
      },
    });

    return !!group;
  }

  async getMinistryGroups(churchId: number) {
    return this.ministryGroupRepository.find({
      where: { churchId },
      relations: {
        //ministries: true,
      },
      order: { createdAt: 'ASC' },
    });
  }

  async getMinistryGroupModelById(
    churchId: number,
    ministryGroupId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<MinistryGroupModel>,
  ) {
    const ministryGroupRepository = this.getMinistryGroupRepository(qr);

    const ministryGroup = await ministryGroupRepository.findOne({
      where: {
        id: ministryGroupId,
        churchId,
      },
      relations: {
        ...relationOptions,
      },
    });

    if (!ministryGroup) {
      throw new NotFoundException('해당 사역 그룹을 찾을 수 없습니다.');
    }

    return ministryGroup;
  }

  async getMinistryGroupById(
    churchId: number,
    ministryGroupId: number,
    qr?: QueryRunner,
  ) {
    const ministryGroupRepository = this.getMinistryGroupRepository(qr);

    const ministryGroup = await ministryGroupRepository.findOne({
      where: {
        churchId,
        id: ministryGroupId,
      },
      relations: {
        ministries: true,
      },
    });

    if (!ministryGroup) {
      throw new NotFoundException('해당 사역 그룹을 찾을 수 없습니다.');
    }

    return {
      ...ministryGroup,
      parentMinistryGroups: await this.getParentMinistryGroups(
        churchId,
        ministryGroupId,
        qr,
      ),
    };
  }

  async getParentMinistryGroups(
    churchId: number,
    ministryGroupId: number,
    qr?: QueryRunner,
  ) {
    const ministryGroupRepository = this.getMinistryGroupRepository(qr);

    const parents = await ministryGroupRepository.query(
      `
    WITH RECURSIVE parent_groups AS (
      -- 초기 그룹의 부모
      SELECT g.* 
      FROM ministry_group_model g
      JOIN ministry_group_model child 
      ON g.id = child."parentMinistryGroupId"
      WHERE child.id = $1 AND child."churchId" = $2
      
      UNION ALL
      
      -- 재귀적으로 부모의 부모 찾기
      SELECT g.*
      FROM ministry_group_model g
      JOIN parent_groups pg 
      ON g.id = pg."parentMinistryGroupId"
    )
    SELECT * FROM parent_groups;
    `,
      [ministryGroupId, churchId],
    );

    let result: {
      id: number;
      name: string;
      parentMinistryGroupId: number | null;
      depth: number;
    }[] = [];

    parents.forEach((parent: MinistryGroupModel, i: number) => {
      result.unshift({
        id: parent.id,
        name: parent.name,
        parentMinistryGroupId: parent.parentMinistryGroupId,
        depth: parents.length - i,
      });
    });

    return result;
  }

  async createMinistryGroup(
    churchId: number,
    dto: CreateMinistryGroupDto,
    qr: QueryRunner,
  ) {
    await this.checkChurchExist(churchId, qr);

    const ministryGroupRepository = this.getMinistryGroupRepository(qr);

    const existingMinistryGroup = await ministryGroupRepository.findOne({
      where: {
        churchId,
        parentMinistryGroupId: dto.parentMinistryGroupId
          ? dto.parentMinistryGroupId
          : IsNull(),
        name: dto.name,
      },
      relations: {
        childMinistryGroups: true,
        ministries: true,
      },
      withDeleted: true,
    });

    if (existingMinistryGroup) {
      if (!existingMinistryGroup.deletedAt) {
        throw new BadRequestException('이미 존재하는 사역 그룹 이름입니다.');
      }

      await ministryGroupRepository.remove(existingMinistryGroup);
    }

    // 상위 그룹 지정 시
    if (dto.parentMinistryGroupId) {
      const parentMinistryGroup = await this.getMinistryGroupModelById(
        churchId,
        dto.parentMinistryGroupId,
        qr,
      );

      /**
       * 그룹 depth 확인 후 5 넘을 경우 BadRequestException
       */

      const newGroup = await ministryGroupRepository.save({
        churchId,
        name: dto.name,
        parentMinistryGroupId: dto.parentMinistryGroupId,
      });

      await this.appendChildMinistryGroupId(
        parentMinistryGroup.id,
        newGroup.id,
        ministryGroupRepository,
        qr,
      );

      return newGroup;
    }

    // 루트 그룹 생성 시
    return ministryGroupRepository.save({
      churchId,
      ...dto,
    });
  }

  private async isValidParentMinistryGroup(
    churchId: number,
    targetMinistryGroup: MinistryGroupModel,
    newParentGroupId: number,
    qr: QueryRunner,
  ) {
    // 새 부모 그룹 조회, 없다면 NotFoundException
    const newParentMinistryGroup = await this.getMinistryGroupModelById(
      churchId,
      newParentGroupId,
      qr,
    );

    if (
      targetMinistryGroup.childMinistryGroupIds.includes(
        newParentMinistryGroup.id,
      )
    ) {
      throw new BadRequestException(
        '현재 하위 그룹을 새로운 상위 그룹으로 지정할 수 없습니다.',
      );
    }

    return true;
  }

  async updateMinistryGroup(
    churchId: number,
    ministryGroupId: number,
    dto: UpdateMinistryGroupDto,
    qr: QueryRunner,
  ) {
    await this.checkChurchExist(churchId, qr);

    const ministryGroupRepository = this.getMinistryGroupRepository(qr);

    // 변경 전 사역 그룹
    const targetGroup = await this.getMinistryGroupModelById(
      churchId,
      ministryGroupId,
      qr,
    );

    const newParentMinistryGroupId =
      dto.parentMinistryGroupId !== undefined
        ? dto.parentMinistryGroupId
        : targetGroup.parentMinistryGroupId;

    // 이름 변경하는 경우 중복 확인
    if (
      dto.name &&
      (await this.isExistMinistryGroup(
        churchId,
        newParentMinistryGroupId,
        dto.name,
        qr,
      ))
    ) {
      throw new BadRequestException('이미 존재하는 사역 그룹 이름입니다.');
    }

    // 상위 그룹을 변경하려는 경우
    if (dto.parentMinistryGroupId !== undefined) {
      if (dto.parentMinistryGroupId !== null) {
        await this.isValidParentMinistryGroup(
          churchId,
          targetGroup,
          newParentMinistryGroupId,
          qr,
        );
      }

      // childGroupIds 업데이트
      await Promise.all([
        this.removeChildMinistryGroupId(
          targetGroup.parentMinistryGroupId,
          targetGroup.id,
          ministryGroupRepository,
          qr,
        ),
        this.appendChildMinistryGroupId(
          dto.parentMinistryGroupId,
          targetGroup.id,
          ministryGroupRepository,
          qr,
        ),
      ]);

      await ministryGroupRepository.update({ id: ministryGroupId }, { ...dto });

      return this.getMinistryGroupById(churchId, ministryGroupId, qr);

      /*return ministryGroupRepository.findOne({
        where: { id: ministryGroupId, churchId },
      });*/
    }

    // 이름만 변경하는 경우
    await ministryGroupRepository.update({ id: ministryGroupId }, { ...dto });

    return this.getMinistryGroupById(churchId, ministryGroupId, qr);
    /*return ministryGroupRepository.findOne({
      where: { id: ministryGroupId, churchId },
    });*/
  }

  async deleteMinistryGroup(
    churchId: number,
    ministryGroupId: number,
    qr: QueryRunner,
  ) {
    const ministryGroupRepository = this.getMinistryGroupRepository(qr);

    const deleteTarget = await this.getMinistryGroupModelById(
      churchId,
      ministryGroupId,
      qr,
      { ministries: true },
    );

    /*// 하위 그룹 or 사역이 있을 경우 Exception
    if (
      deleteTarget.childMinistryGroupIds.length > 0 ||
      deleteTarget.ministries.length > 0
    ) {
      throw new BadRequestException(
        '해당 사역 그룹에 속한 하위 사역 그룹 또는 사역이 존재합니다.',
      );
    }

    await ministryGroupRepository.softDelete({
      id: ministryGroupId,
      churchId,
    });
    */

    await ministryGroupRepository.softRemove(deleteTarget);

    await this.removeChildMinistryGroupId(
      deleteTarget.parentMinistryGroupId,
      deleteTarget.id,
      ministryGroupRepository,
      qr,
    );

    return `ministryGroupId ${ministryGroupId} deleted`;
  }

  async getMinistryGroupsCascade(
    churchId: number,
    ministryGroupId: number,
    qr?: QueryRunner,
  ) {
    const ministryGroupsRepository = this.getMinistryGroupRepository(qr);

    const ministryGroup = await this.getMinistryGroupModelById(
      churchId,
      ministryGroupId,
      qr,
    );

    const subGroupsQuery = await ministryGroupsRepository.query(
      `
        WITH RECURSIVE group_tree AS (
      -- 초기 그룹의 직계 그룹들
      SELECT id, "parentMinistryGroupId", 1 as level, name
    FROM ministry_group_model
    WHERE "parentMinistryGroupId" = $1 AND "deletedAt" IS NULL 
    
    UNION ALL 
    
    SELECT g.id, g."parentMinistryGroupId", gt.level + 1, g.name
    FROM ministry_group_model g
    INNER JOIN group_tree gt ON g."parentMinistryGroupId" = gt.id
    WHERE g."deletedAt" IS NULL
    )
    SELECT id, level, name FROM group_tree
        `,
      [ministryGroup.id],
    );

    return subGroupsQuery.map((row: any) => row.id);
  }

  private async appendChildMinistryGroupId(
    parentMinistryGroupId: number,
    childMinistryGroupId: number,
    ministryGroupRepository: Repository<MinistryGroupModel>,
    qr: QueryRunner,
  ) {
    await ministryGroupRepository
      .createQueryBuilder(undefined, qr)
      .update()
      .set({
        childMinistryGroupIds: () =>
          `array_append("childMinistryGroupIds", :childMinistryGroupId)`,
      })
      .where('id= :id', { id: parentMinistryGroupId })
      .setParameters({ childMinistryGroupId: childMinistryGroupId })
      .execute();
  }

  private async removeChildMinistryGroupId(
    parentMinistryGroupId: number,
    childMinistryGroupId: number,
    ministryGroupRepository: Repository<MinistryGroupModel>,
    qr: QueryRunner,
  ) {
    await ministryGroupRepository
      .createQueryBuilder(undefined, qr)
      .update()
      .set({
        childMinistryGroupIds: () =>
          `array_remove("childMinistryGroupIds", :childMinistryGroupId)`,
      })
      .where('id= :id', { id: parentMinistryGroupId })
      .setParameters({ childMinistryGroupId })
      .execute();
  }
}
