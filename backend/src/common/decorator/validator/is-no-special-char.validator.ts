import { Matches, ValidationOptions } from 'class-validator';

export function IsNoSpecialChar() {
  return Matches(/^[a-zA-Z0-9ㄱ-힣 \-]+$/, {
    message: '허용되지 않는 특수문자가 포함되어 있습니다.',
  });
}

export function IsBasicText(
  fieldName: string,
  validationOptions?: ValidationOptions,
) {
  return Matches(/^[a-zA-Z0-9ㄱ-힣\s\-.,!?()'"/:;·\[\]]*$/, {
    message: `허용되지 않는 특수문자가 포함되어 있습니다. (${fieldName})`,
    ...validationOptions,
  });
}
