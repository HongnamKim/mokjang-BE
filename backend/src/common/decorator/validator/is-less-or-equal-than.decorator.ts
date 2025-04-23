import {
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidatorOptions,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsLessOrEqualThan', async: false })
export class IsLessThanOrEqualConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, validationArguments: ValidationArguments): boolean {
    const [constraintKey] = validationArguments.constraints;

    const constraintValue = (validationArguments.object as any)[constraintKey];

    return constraintValue ? value <= constraintValue : true;
  }

  defaultMessage(args: ValidationArguments): string {
    const { property, constraints } = args;

    return `${property} 은 ${constraints[0]} 이하여야 합니다.`;
  }
}

export function IsLessThanOrEqual(property: string, args?: ValidatorOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: args,
      constraints: [property],
      validator: IsLessThanOrEqualConstraint,
    });
  };
}
