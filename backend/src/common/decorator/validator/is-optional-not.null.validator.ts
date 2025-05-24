import {
  registerDecorator,
  ValidateIf,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { CommonException } from '../../const/exception/common.exception';

/**
 * IsOptional 과 같은 기능이지만 값이 null 인 경우 검증 실패
 * @param validationOptions
 * @constructor
 */
export function IsOptionalNotNull(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    // undefined면 모든 validation skip
    ValidateIf((_, value) => value !== undefined)(object, propertyName);
    registerDecorator({
      name: 'isNotNull',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (value === undefined) return true;

          return value !== null;
        },
        defaultMessage() {
          return CommonException.NOT_NULL(propertyName);
        },
      },
    });
  };
}
