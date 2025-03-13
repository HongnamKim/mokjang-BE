import { Injectable } from '@nestjs/common';
import { GetMemberDto } from '../dto/get-member.dto';
import {
  ArrayContains,
  Between,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  ILike,
  In,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
} from 'typeorm';
import { MemberModel } from '../entity/member.entity';
import {
  DefaultMembersRelationOption,
  DefaultMembersSelectOption,
} from '../const/default-find-options.const';
import { GetMemberOrderEnum } from '../const/enum/get-member-order.enum';

@Injectable()
export class SearchMembersService {
  constructor() {}

  private CHURCH_MANAGEMENT_COLUMNS = [
    'group',
    'ministries',
    'educations',
    'officer',
  ];

  private SELECT_PREFIX = 'select__';

  //private PAGING_OPTIONS = ['take', 'page', 'order', 'orderDirection'];

  private isSelectColumn(key: string): boolean {
    return key.startsWith(this.SELECT_PREFIX);
  }

  private getColumnName(key: string): string {
    return key.split('__')[1];
  }

  private isChurchManagementColumn(column: string): boolean {
    return this.CHURCH_MANAGEMENT_COLUMNS.includes(column);
  }

  private setColumnRelation(
    column: string,
    value: boolean,
    relationOptions: FindOptionsRelations<MemberModel>,
  ) {
    switch (column) {
      case 'educations':
        relationOptions[column] = {
          educationTerm: value,
        };
        break;
      case 'group':
        relationOptions[column] = value;
        relationOptions['groupRole'] = value;
        break;
      default:
        relationOptions[column] = value;
    }
  }

  private setCustomRelations(
    dto: GetMemberDto,
    relationOptions: FindOptionsRelations<MemberModel>,
  ) {
    let hasCustomColumns = false;

    Object.entries(dto).forEach(([key, value]) => {
      if (!this.isSelectColumn(key) || value === false) return;

      // 선택한 컬럼 추가
      const column = this.getColumnName(key);

      if (!this.isChurchManagementColumn(column)) return;

      hasCustomColumns = true;
      this.setColumnRelation(column, value, relationOptions);
    });

    return hasCustomColumns;
  }

  private setDefaultRelation(
    relationOptions: FindOptionsRelations<MemberModel>,
  ) {
    Object.entries(DefaultMembersRelationOption).forEach(([key, value]) => {
      relationOptions[key] = value;
    });
  }

  private addOrderRelation(
    dto: GetMemberDto,
    relationOptions: FindOptionsRelations<MemberModel>,
  ) {
    if (this.CHURCH_MANAGEMENT_COLUMNS.includes(dto.order)) {
      relationOptions[dto.order as string] = true;
    }
  }

  /**
   * GetMemberDto를 기반으로 TypeORM relation 옵션을 생성합니다.
   *
   * select__ 로 시작하는 프로퍼티가 존재할 때 동작합니다.
   *
   * @param dto - 회원 조회를 위한 DTO
   * @returns FindOptionsRelations<MemberModel> - TypeORM relation 옵션
   *
   * @description
   * 1. 사용자가 선택한 컬럼에 대한 relation을 설정합니다.
   * 2. 선택된 컬럼이 없다면 기본 relation 옵션을 사용합니다.
   * 3. 정렬 기준이 join이 필요한 컬럼인 경우 해당 relation도 추가합니다.
   *
   * @example
   * // 교육 정보가 포함된 relation 옵션 생성
   * const dto = { select__educations: true };
   * const relations = parseRelationOption(dto);
   * // result: { educations: { educationTerm: true } }
   *
   * // 기본 relation 옵션 사용
   * const dto = {};
   * const relations = parseRelationOption(dto);
   * // result: DefaultMembersRelationOption
   */
  parseRelationOption(dto: GetMemberDto) {
    const relationOptions: FindOptionsRelations<MemberModel> = {};

    const hasCustomColumns = this.setCustomRelations(dto, relationOptions);

    // 컬럼 사용자화 하지 않은 경우 기본 relationOption 복사
    if (!hasCustomColumns) {
      this.setDefaultRelation(relationOptions);
    }

    // 정렬 기준이 join 이 필요한 컬럼인 경우
    this.addOrderRelation(dto, relationOptions);

    return relationOptions;
  }

  private setCustomSelect(
    dto: GetMemberDto,
    selectOptions: FindOptionsSelect<MemberModel>,
  ) {
    let hasCustomColumns = false;

    Object.entries(dto).forEach(([key, value]) => {
      if (!this.isSelectColumn(key) || value === false) return;

      const column = this.getColumnName(key);
      hasCustomColumns = true;

      if (this.isChurchManagementColumn(column)) {
        this.setChurchManagementSelect(column, value, selectOptions);
        return;
      }

      this.setSpecialColumnSelect(column, value, selectOptions);
    });

    return hasCustomColumns;
  }

  private setChurchManagementSelect(
    column: string,
    value: string,
    selectOptions: FindOptionsSelect<MemberModel>,
  ) {
    // 사역, 직분, 그룹, 교육
    switch (column) {
      case 'educations':
        selectOptions[column] = {
          id: true,
          status: true,
          educationTerm: {
            id: true,
            term: true,
            educationName: true,
          },
        };
        break;
      case 'group':
        selectOptions[column] = {
          id: true,
          name: true,
        };
        selectOptions['groupRole'] = {
          id: true,
          role: true,
        };
        break;
      default:
        selectOptions[column] = {
          id: value,
          name: value,
        };
    }
  }

  private setSpecialColumnSelect(
    column: string,
    value: boolean,
    selectOptions: FindOptionsSelect<MemberModel>,
  ) {
    switch (column) {
      case 'address':
        // 도로명 주소 선택 시 상제 주소 추가
        selectOptions[column] = value;
        selectOptions['detailAddress'] = value;
        break;
      case 'birth':
        selectOptions[column] = value;
        selectOptions['isLunar'] = value;
        break;
      default:
        selectOptions[column] = value;
    }
  }

  private setRequiredSelect(dto: GetMemberDto) {
    return {
      id: true,
      registeredAt: true,
      name: true,
      [dto.order]: this.isChurchManagementColumn(dto.order)
        ? { id: true, name: true }
        : true,
    };
  }

  /**
   * GetMemberDto를 기반으로 TypeORM select 옵션을 생성합니다.
   *
   * @param dto - 회원 조회를 위한 DTO
   * @returns FindOptionsSelect<MemberModel> - TypeORM select 옵션
   *
   * @description
   * 1. 사용자가 선택한 컬럼에 대한 select 옵션을 설정합니다.
   * 2. 필수 컬럼(id, name 등)을 항상 포함합니다.
   * 3. 선택된 컬럼이 없다면 기본 select 옵션을 사용합니다.
   */
  parseSelectOption(dto: GetMemberDto) {
    const selectOptions: FindOptionsSelect<MemberModel> = {};

    const hasCustomColumns = this.setCustomSelect(dto, selectOptions);
    const requiredSelect = this.setRequiredSelect(dto);

    return hasCustomColumns
      ? { ...requiredSelect, ...selectOptions }
      : { ...requiredSelect, ...DefaultMembersSelectOption };

    /*let needDefaultSelectOptions = true;

    // 컬럼 사용자화
    Object.entries(dto).forEach(([key, value]) => {
      if (!key.startsWith(this.SELECT_PREFIX) || value === false) return;

      needDefaultSelectOptions = false;

      // 컬럼 사용자화
      const [, column] = key.split('__');

      if (this.CHURCH_MANAGEMENT_COLUMNS.includes(column)) {
        // 사역, 직분, 그룹, 교육
        switch (column) {
          case 'educations':
            selectOptions[column] = {
              id: true,
              status: true,
              educationTerm: {
                id: true,
                term: true,
                educationName: true,
              },
            };
            break;
          case 'group':
            selectOptions[column] = {
              id: true,
              name: true,
            };
            selectOptions['groupRole'] = {
              id: true,
              role: true,
            };
            break;
          default:
            selectOptions[column] = {
              id: value,
              name: value,
            };
        }

        needDefaultSelectOptions = false;
        return;
      }

      if (column === 'address') {
        // 도로명 주소 선택 시 상제 주소 추가
        selectOptions[column] = value;
        selectOptions['detailAddress'] = value;

        needDefaultSelectOptions = false;

        return;
      }
      if (column === 'birth') {
        // 생년월일 추가 시 음력여부 추가
        selectOptions[column] = value;
        selectOptions['isLunar'] = value;

        needDefaultSelectOptions = false;

        return;
      }

      selectOptions[column] = value;
    });

    // 항상 들어가야할 컬럼
    const result: FindOptionsSelect<MemberModel> = {
      id: true,
      registeredAt: true,
      name: true,
      [dto.order]: this.CHURCH_MANAGEMENT_COLUMNS.includes(dto.order)
        ? { id: true, name: true }
        : true,
    };

    return needDefaultSelectOptions
      ? { ...result, ...DefaultMembersSelectOption }
      : { ...result, ...selectOptions };*/
  }

  parseWhereOption(churchId: number, dto: GetMemberDto) {
    const createDateFilter = (start?: Date, end?: Date) =>
      start && end
        ? Between(start, end)
        : start
          ? MoreThanOrEqual(start)
          : end
            ? LessThanOrEqual(end)
            : undefined;

    const findOptionsWhere: FindOptionsWhere<MemberModel> = {
      churchId,
      name: dto.name && ILike(`%${dto.name}%`),
      mobilePhone: dto.mobilePhone && Like(`%${dto.mobilePhone}%`),
      homePhone: dto.homePhone && Like(`%${dto.homePhone}%`),
      address: dto.address && Like(`%${dto.address}%`),
      birth: createDateFilter(dto.birthAfter, dto.birthBefore),
      registeredAt: createDateFilter(dto.registerAfter, dto.registerBefore),
      updatedAt: createDateFilter(dto.updateAfter, dto.updateBefore),
      gender: dto.gender && In(dto.gender),
      marriage: dto.marriage && In(dto.marriage),
      school: dto.school && Like(`%${dto.school}%`),
      occupation: dto.occupation && Like(`%${dto.occupation}%`),
      vehicleNumber: dto.vehicleNumber && ArrayContains(dto.vehicleNumber),
      baptism: dto.baptism && In(dto.baptism),
      groupId: dto.group && In(dto.group),
      officerId: dto.officer && In(dto.officer),
      ministries: dto.ministries && { id: In(dto.ministries) },
      educations: dto.educations && {
        educationTerm: {
          educationId: In(dto.educations),
        },
        status: dto.educationStatus && In(dto.educationStatus),
      },
    };

    return findOptionsWhere;
  }

  parseOrderOption(dto: GetMemberDto) {
    const findOptionsOrder: FindOptionsOrder<MemberModel> = {};

    if (
      dto.order === GetMemberOrderEnum.group ||
      dto.order === GetMemberOrderEnum.officer
    ) {
      findOptionsOrder[dto.order as string] = {
        name: dto.orderDirection,
      };
      findOptionsOrder.registeredAt = 'asc';
    } else {
      findOptionsOrder[dto.order as string] = dto.orderDirection;
      if (dto.order !== GetMemberOrderEnum.registeredAt) {
        findOptionsOrder.registeredAt = 'asc';
      } else {
        findOptionsOrder.id = 'asc';
      }
    }

    return findOptionsOrder;
  }
}
