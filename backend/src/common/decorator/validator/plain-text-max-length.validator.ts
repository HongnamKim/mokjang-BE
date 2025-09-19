import {
  registerDecorator,
  ValidationArguments,
  ValidatorOptions,
} from 'class-validator';

export function PlainTextMaxLength(
  maxLength: number,
  validatorOptions?: ValidatorOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'PlainTextMaxLength',
      target: object.constructor,
      propertyName,
      constraints: [maxLength],
      options: validatorOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (value === null || value === undefined) return true;
          if (typeof value !== 'string') return true;

          const plainText = value.replace(/<[^>]*>/g, '').trim(); // 태그 제거

          return plainText.length <= args.constraints[0];
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property}는 서식을 제외한 텍스트 기준으로 ${args.constraints[0]}자 이하여야 합니다.`;
        },
      },
    });
  };
}
