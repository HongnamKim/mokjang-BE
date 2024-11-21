import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseModel } from './entity/base.entity';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { FILTER_MAPPER } from './const/filter-mapper.const';
import { BasePaginationDto } from './dto/base-pagination.dto';

@Injectable()
export class CommonService {
  async paginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path?: string,
  ) {
    if (dto.page) {
      return this.pagePagination(dto, repository, overrideFindOptions);
    } else {
      return this.cursorPagination(dto, repository, overrideFindOptions, path);
    }
  }

  async cursorPagination<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T>,
    path: string,
  ) {
    const findOptions: FindManyOptions<T> = this.composeFindOptions<T>(dto);

    const result = await repository.find({
      ...findOptions,
      ...overrideFindOptions,
    });

    const lastItem =
      result.length > 0 && result.length === dto.take
        ? result[result.length - 1]
        : null;

    /*let lastItem;

    if (result.length > 0 && result.length === dto.take) {
      lastItem = result[result.length - 1];
    } else {
      lastItem = null;
    }*/

    const baseUrl = 'http://localhost:3001';
    const nextUrl = lastItem && new URL(`${baseUrl}/${path}`);

    if (nextUrl) {
      for (const key of Object.keys(dto)) {
        if (dto[key]) {
          if (
            key !== 'where__id__more_than' &&
            key !== 'where__id__less_than'
          ) {
            nextUrl.searchParams.append(key, dto[key]);
          }
        }
      }
      let key: string;

      if (dto.order__createdAt === 'ASC' || dto.order__createdAt === 'asc') {
        key = 'where__id__more_than';
      } else {
        key = 'where__id__less_than';
      }

      // 마지막 post 의 id 로 쿼리 파라미터 넣어줌.
      nextUrl.searchParams.append(key, lastItem.id.toString());
    }

    return {
      data: result,
      cursor: {
        after: lastItem?.id ?? null,
      },
      count: result.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  async pagePagination<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T>,
  ) {
    const findOptions: FindManyOptions<T> = this.composeFindOptions<T>(dto);

    const result = await repository.find({
      ...findOptions,
      ...overrideFindOptions,
    });
    return {
      data: result,
      count: result.length,
    };
  }

  private composeFindOptions<T extends BaseModel>(dto: BasePaginationDto) {
    //whereFilter : where__id__more_than: 3 -> split.length == 3
    //              where__id: 3 --> split.length == 2
    let where: FindOptionsWhere<T> = {};
    let order: FindOptionsOrder<T> = {};

    for (const [key, value] of Object.entries(dto)) {
      if (key.startsWith('where__')) {
        where = {
          ...where,
          ...this.parseWhereFilter(key, value),
        };
      } else if (key.startsWith('order__')) {
        order = {
          ...order,
          ...this.parseOrderFilter(key, value),
        };
      }
    }

    const findOptions: FindManyOptions<T> = {
      where,
      order,
      take: dto.take,
      skip: dto.page ? dto.take * (dto.page - 1) : null,
    };

    return findOptions;
  }

  private parseOrderFilter<T extends BaseModel>(
    key: string,
    value: 'asc' | 'ASC' | 'desc' | 'DESC',
  ): FindOptionsOrder<T> {
    const orderOptions: FindOptionsOrder<T> = {};

    // key: order__createdAt, order__name
    // value: 'asc' | 'ASC' | 'desc' | 'DESC'
    const split = key.split('__');
    if (split.length !== 2) {
      throw new BadRequestException(`잘못된 order filter option : ${key}`);
    }

    const [_, field] = split;
    orderOptions[field] = value;

    return orderOptions;
  }

  private parseWhereFilter<T extends BaseModel>(
    key: string,
    value: any,
  ): FindOptionsWhere<T> {
    /*
    key: where__id__more_than, where__name__ilike
    key: where__id
     */
    const whereOptions: FindOptionsWhere<T> = {};

    const split = key.split('__');
    if (split.length !== 2 && split.length !== 3) {
      throw new BadRequestException(`잘못된 where filter option : ${key}`);
    }

    if (split.length === 2) {
      const field = split[1];
      // where__id : 3
      whereOptions[field] = value;
      /*
      whereOptions: {
        id: 3
      }
       */
    } else {
      // where__id__more_than
      // where__name__iLike
      const [_, field, operator] = split;
      if (operator === 'i_like') {
        whereOptions[field] = FILTER_MAPPER[operator](`%${value}%`);
      } else {
        whereOptions[field] = FILTER_MAPPER[operator](value);
      }
    }

    return whereOptions;
  }
}
