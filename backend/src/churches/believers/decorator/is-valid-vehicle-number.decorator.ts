import {
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidatorOptions,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: 'IsValidVehicleNumber', async: false })
@Injectable()
export class IsUniqueVehicleNumberConstraint
  implements ValidatorConstraintInterface
{
  defaultMessage(args?: ValidationArguments): string {
    const context = args.constraints[0];

    switch (context.errorType) {
      case 'NOT_NUMBER':
        return '숫자 형태의 string 이 아닙니다.';
      case 'DUPLICATE':
        return '중복된 차량번호입니다.';
      default:
        return '유효하지 않은 차량번호입니다.';
    }
  }

  validate(
    value: string[],
    args?: ValidationArguments,
  ): Promise<boolean> | boolean {
    if (value.some((num) => !parseInt(num))) {
      args.constraints[0] = { errorType: 'NOT_NUMBER' };
      return false;
    }

    // 중복된 차량번호입니다.
    if (value.length !== new Set(value).size) {
      args.constraints[0] = { errorType: 'DUPLICATE' };
      return false;
    }

    return true;
  }
}

export function IsValidVehicleNumber(validationOptions?: ValidatorOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUniqueVehicleNumberConstraint,
    });
  };
}
