export const CommonException = {
  NOT_NULL: (column: string = '') =>
    column
      ? `${column} 에 null 값은 허용되지 않습니다.`
      : 'null 값은 허용되지 않습니다.',
};
