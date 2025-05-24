import {
  MemberSummarizedRelation,
  MemberSummarizedSelect,
} from '../../members/const/member-find-options.const';

export const BaseReportFindOptionsSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  reportedAt: true,
  isRead: true,
  isConfirmed: true,
};

export const EducationReportsFindOptionsRelation = {
  educationSession: {
    inCharge: MemberSummarizedRelation,
  },
};
export const EducationReportsFindOptionsSelect = {
  ...BaseReportFindOptionsSelect,
  educationId: true,
  educationTermId: true,
  educationSessionId: true,
  educationSession: {
    id: true,
    name: true,
    session: true,
    startDate: true,
    endDate: true,
    status: true,
    inCharge: MemberSummarizedSelect,
  },
};
export const EducationReportFindOptionsSelect = {
  ...BaseReportFindOptionsSelect,
  educationId: true,
  educationTermId: true,
  educationSessionId: true,
  educationSession: {
    id: true,
    name: true,
    session: true,
    startDate: true,
    endDate: true,
    status: true,
    content: true,
    inCharge: MemberSummarizedSelect,
  },
};
