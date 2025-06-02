import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { VisitationMetaModel } from '../entity/visitation-meta.entity';
import { VisitationDetailModel } from '../entity/visitation-detail.entity';

export const VisitationRelationOptions: FindOptionsRelations<VisitationMetaModel> =
  {
    members: {
      officer: true,
      group: true,
      groupRole: true,
    },
    inCharge: {
      officer: true,
      group: true,
      groupRole: true,
    },
    creator: {
      officer: true,
      group: true,
      groupRole: true,
    },
    reports: {
      receiver: {
        officer: true,
        group: true,
        groupRole: true,
      },
    },
    visitationDetails: {
      member: {
        group: true,
        groupRole: true,
        officer: true,
      },
    },
  };

export const VisitationSelectOptions: FindOptionsSelect<VisitationMetaModel> = {
  creator: {
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
    groupRole: {
      id: true,
      role: true,
    },
  },
  inCharge: {
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
    groupRole: {
      id: true,
      role: true,
    },
  },
  members: {
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
    groupRole: {
      id: true,
      role: true,
    },
  },
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
      groupRole: {
        id: true,
        role: true,
      },
    },
  },
  visitationDetails: {
    id: true,
    createdAt: true,
    updatedAt: true,
    visitationPray: true,
    visitationContent: true,
    member: {
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
      groupRole: {
        id: true,
        role: true,
      },
    },
  },
};

export const VisitationDetailRelationOptions: FindOptionsRelations<VisitationDetailModel> =
  {
    member: {
      officer: true,
      group: true,
      groupRole: true,
    },
  };

export const VisitationDetailSelectOptions: FindOptionsSelect<VisitationDetailModel> =
  {
    member: {
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
      groupRole: {
        id: true,
        role: true,
      },
    },
  };
