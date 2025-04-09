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
    instructor: {
      officer: true,
      group: true,
      groupRole: true,
    },
    creator: {
      officer: true,
      group: true,
      groupRole: true,
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
  instructor: {
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
