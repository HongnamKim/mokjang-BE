export enum EducationOrderEnum {
  name = 'name',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
}

export enum EducationTermOrderEnum {
  term = 'term',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
}

export enum EducationSessionOrderEnum {
  session = 'session',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  endDate = 'endDate',
}

export enum EducationEnrollmentOrderEnum {
  memberId = 'memberId',
  status = 'status',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
}

export enum AttendanceOrderEnum {
  //name = 'name',
  educationEnrollmentId = 'educationEnrollmentId',
  isPresent = 'isPresent',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
}
