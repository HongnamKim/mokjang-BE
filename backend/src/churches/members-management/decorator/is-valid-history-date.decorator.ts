import {
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidatorOptions,
} from 'class-validator';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

@ValidatorConstraint({ name: 'IsValidHistoryDate', async: false })
@Injectable()
export class IsValidHistoryDateConstraint
  implements ValidatorConstraintInterface
{
  defaultMessage(validationArguments?: ValidationArguments): string {
    return '';
  }

  validate(
    value: any,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> | boolean {
    if (!(value instanceof Date)) {
      throw new InternalServerErrorException(
        '시작날짜 검증 데코레이터 사용 오류',
      );
    }

    const input = value.setHours(0, 0, 0, 0);

    const now = new Date().setHours(0, 0, 0, 0);

    if (input > now) {
      throw new BadRequestException(
        '이력의 날짜는 현재 날짜를 넘어설 수 없습니다.',
      );
    }

    return true;
  }
}

export function IsValidHistoryDate(validationOptions?: ValidatorOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidHistoryDateConstraint,
    });
  };
}
