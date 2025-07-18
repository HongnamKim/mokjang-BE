import {
  registerDecorator,
  ValidationArguments,
  ValidatorOptions,
} from 'class-validator';
import { endOfDay, startOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { TIME_ZONE } from '../../common/const/time-zone.const';

export function IsValidHistoryDateString(
  fieldLabel: string,
  validationOptions?: ValidatorOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: `${fieldLabel} 은 오늘 날짜를 앞설 수 없습니다.`,
        ...validationOptions,
      },
      validator: {
        validate(value: any, _args: ValidationArguments) {
          const now = endOfDay(toZonedTime(new Date(), TIME_ZONE.SEOUL));
          const input = startOfDay(value);

          return input <= now;
        },
      },
    });
  };
}
