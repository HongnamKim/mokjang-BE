import 'reflect-metadata';

export const SANITIZE_MARK = Symbol('SANITIZE_MARK');

export function SanitizeDto(): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(SANITIZE_MARK, true, target);
  };
}

export function isSanitizeDto(target: any) {
  return Reflect.getMetadata(SANITIZE_MARK, target) === true;
}
