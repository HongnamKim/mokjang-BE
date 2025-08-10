import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsDateTime(
  fieldLabel: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDateTime',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: `${fieldLabel}은(는) YYYY-MM-DDTHH:mm:ss 형식이어야 합니다.`,
        ...validationOptions,
      },
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (typeof value !== 'string') return false;

          // ISO 8601 형식 검증 (초까지)
          const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
          if (!regex.test(value)) return false;

          // 실제 유효한 날짜인지 검증
          const date = new Date(value);
          return !isNaN(date.getTime());
        },
      },
    });
  };
}
