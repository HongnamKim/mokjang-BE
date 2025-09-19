/*import { ValidationOptions } from 'joi';
import {
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { VisitationDetailDto } from '../dto/internal/visittion-detail.dto';

@ValidatorConstraint({ name: 'VisitationDetailValidator', async: false })
export class VisitationDetailConstraint
  implements ValidatorConstraintInterface
{
  defaultMessage(validationArguments?: ValidationArguments): string {
    return '중복된 심방 대상자가 존재합니다.';
  }

  validate(
    value: VisitationDetailDto[],
    validationArguments?: ValidationArguments,
  ): Promise<boolean> | boolean {
    const memberIds = value.map((detail) => detail.memberId);

    const memberIdsSet = new Set(memberIds);

    return memberIds.length === memberIdsSet.size;
  }
}

export function VisitationDetailValidator(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: VisitationDetailConstraint,
    });
  };
}*/
