import {
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidatorOptions,
} from 'class-validator';
import { CreateEducationTermDto } from '../dto/education/terms/create-education-term.dto';

@ValidatorConstraint({ name: 'IsAfterDate', async: false })
export class IsValidEndDateConstraint implements ValidatorConstraintInterface {
  defaultMessage(validationArguments: ValidationArguments): string {
    const { property, constraints } = validationArguments;

    return `${property} 은 ${constraints[0]} 보다 이후여야 합니다.`;

    //return '종료일은 시작일보다 이후여야 합니다.';
  }

  validate(
    value: any,
    validationArguments: ValidationArguments,
  ): Promise<boolean> | boolean {
    const [startDatePropertyName] = validationArguments.constraints;

    const startDate = (validationArguments.object as CreateEducationTermDto)[
      startDatePropertyName
    ];

    return value >= startDate;
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
      validator: IsValidEndDateConstraint,
    });
  };
}
