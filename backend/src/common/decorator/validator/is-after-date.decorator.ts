import {
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidatorOptions,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsAfterDate', async: false })
export class IsAfterDateConstraint implements ValidatorConstraintInterface {
  defaultMessage(validationArguments: ValidationArguments): string {
    const { property, constraints } = validationArguments;

    return `${property} 은 ${constraints[0]} 보다 이후여야 합니다.`;
  }

  validate(
    value: any,
    validationArguments: ValidationArguments,
  ): Promise<boolean> | boolean {
    const [startDatePropertyName] = validationArguments.constraints;

    const startDate = validationArguments.object[startDatePropertyName];

    return startDate ? value >= startDate : value;
  }
}

export function IsAfterDate(
  property: string,
  validationOptions?: ValidatorOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsAfterDateConstraint,
    });
  };
}
