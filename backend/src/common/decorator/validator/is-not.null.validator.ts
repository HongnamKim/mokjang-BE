import { registerDecorator, ValidationOptions } from 'class-validator';
import { CommonException } from '../../const/exception/common.exception';

export function IsNotNull(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotNull',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (value === undefined) return true;

          return value !== null;
        },
        defaultMessage() {
          return CommonException.NOT_NULL;
        },
      },
    });
  };
}
