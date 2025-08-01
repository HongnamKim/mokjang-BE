import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { VisitationMetaModel } from '../entity/visitation-meta.entity';
import { VisitationDetailModel } from '../entity/visitation-detail.entity';
import { MemberSummarizedSelect } from '../../members/const/member-find-options.const';

export const VisitationRelationOptions: FindOptionsRelations<VisitationMetaModel> =
  {
    members: {
      officer: true,
      group: true,
    },
    inCharge: {
      officer: true,
      group: true,
    },
    creator: {
      officer: true,
      group: true,
    },
    reports: {
      receiver: {
        officer: true,
        group: true,
      },
    },
    visitationDetails: true,
  };

export const VisitationSelectOptions: FindOptionsSelect<VisitationMetaModel> = {
  creator: MemberSummarizedSelect,
  inCharge: MemberSummarizedSelect,
  members: MemberSummarizedSelect,
  reports: {
    id: true,
    isRead: true,
    isConfirmed: true,
    receiver: {
      id: true,
      name: true,
      officer: {
        id: true,
        name: true,
      },
      group: {
        id: true,
        name: true,
      },
      groupRole: true,
    },
  },
  visitationDetails: {
    id: true,
    createdAt: true,
    updatedAt: true,
    visitationPray: true,
    visitationContent: true,
  },
};

export const VisitationDetailRelationOptions: FindOptionsRelations<VisitationDetailModel> =
  {
    /*member: {
      officer: true,
      group: true,
      //groupRole: true,
    },*/
  };

export const VisitationDetailSelectOptions: FindOptionsSelect<VisitationDetailModel> =
  {
    /*member: {
      id: true,
      name: true,
      officer: {
        id: true,
        name: true,
      },
      group: {
        id: true,
        name: true,
      },
      groupRole: true,
    },*/
  };
