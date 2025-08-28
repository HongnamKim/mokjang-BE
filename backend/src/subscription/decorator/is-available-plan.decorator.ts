import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { SubscriptionPlan } from '../const/subscription-plan.enum';
import { SubscriptionException } from '../exception/subscription.exception';

export function IsAvailablePlan(
  unavailablePlans: SubscriptionPlan[],
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isAvailablePlan',
      target: object.constructor,
      propertyName,
      constraints: [unavailablePlans],
      options: validationOptions,
      validator: {
        defaultMessage(): string {
          return SubscriptionException.UNAVAILABLE_PLAN;
        },
        validate(value: SubscriptionPlan, args: ValidationArguments) {
          return !args.constraints[0].includes(value);
        },
      },
    });
  };
}
