import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsYYYYMMDD(
  fieldLabel: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isYYYYMMDD',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: `${fieldLabel} 은 YYYY-MM-DD 형식이어야 합니다.`,
        ...validationOptions,
      },
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          return /^\d{4}-\d{2}-\d{2}$/.test(value);
        },
      },
    });
  };
}
