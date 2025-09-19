import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { VisitationMetaModel } from '../entity/visitation-meta.entity';
import { VisitationDetailModel } from '../entity/visitation-detail.entity';
import { MemberSimpleSelect } from '../../members/const/member-find-options.const';

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

export const VisitationListRelationOptions: FindOptionsRelations<VisitationMetaModel> =
  {
    members: {
      officer: true,
      group: true,
    },
    inCharge: {
      officer: true,
      group: true,
    },
    //visitationDetails: true,
  };

export const VisitationListSelectOptions: FindOptionsSelect<VisitationMetaModel> =
  {
    inCharge: MemberSimpleSelect,
    members: MemberSimpleSelect,
  };

export const VisitationSelectOptions: FindOptionsSelect<VisitationMetaModel> = {
  creator: MemberSimpleSelect,
  inCharge: MemberSimpleSelect,
  members: MemberSimpleSelect,
  reports: {
    id: true,
    isRead: true,
    isConfirmed: true,
    receiver: MemberSimpleSelect,
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
