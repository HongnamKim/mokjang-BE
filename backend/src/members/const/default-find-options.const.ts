import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { MemberModel } from '../entity/member.entity';

export const DefaultMemberRelationOption: FindOptionsRelations<MemberModel> = {
  guiding: false,
  guidedBy: true,
  family: {
    familyMember: true,
  },
  officer: true,
  ministries: true,
  educationEnrollments: {
    educationTerm: true,
  },
  group: true,
  //groupRole: true,
  //user: true,
};

export const DefaultMemberSelectOption: FindOptionsSelect<MemberModel> = {
  guidedBy: {
    id: true,
    name: true,
  },
  officer: {
    id: true,
    name: true,
  },
  ministries: {
    id: true,
    name: true,
  },
  educationEnrollments: {
    id: true,
    status: true,
    educationTerm: {
      id: true,
      term: true,
      educationName: true,
    },
  },
  group: {
    id: true,
    name: true,
  },
  /*groupRole: {
    id: true,
    role: true,
  },*/
  /*user: {
    role: true,
  },*/
};

export const DefaultMembersRelationOption: FindOptionsRelations<MemberModel> = {
  group: true,
  //groupRole: true,
  ministries: true,
  educationEnrollments: {
    educationTerm: true,
  },
  officer: true,
  //user: true,
};

export const DefaultMembersSelectOption: FindOptionsSelect<MemberModel> = {
  id: true,
  profileImageUrl: true,
  name: true,
  createdAt: true,
  updatedAt: true,
  registeredAt: true,
  mobilePhone: true,
  birth: true,
  isLunar: true,
  gender: true,
  groupRole: true,
  group: {
    id: true,
    name: true,
  },
  /*groupRole: {
    id: true,
    role: true,
  },*/
  ministries: {
    id: true,
    name: true,
  },
  educationEnrollments: {
    id: true,
    status: true,
    educationTerm: {
      id: true,
      term: true,
      educationName: true,
    },
  },
  officer: {
    id: true,
    name: true,
  },
  /*user: {
    role: true,
  },*/
};

export const HardDeleteMemberRelationOptions: FindOptionsRelations<MemberModel> =
  {
    ...DefaultMemberRelationOption,
    guiding: true,
    inChargeEducationTerm: true,
    ministryHistory: true,
    officerHistory: true,
    groupHistory: true,
  };

const result = {
  data: {
    id: 1,
    createdAt: '2025-05-29T07:42:07.573Z',
    updatedAt: '2025-08-12T02:02:42.945Z',
    deletedAt: null,
    churchId: 1,
    registeredAt: '2025-06-10T17:37:17.485Z',
    profileImageUrl: 'www.google.com',
    name: '김홍남',
    mobilePhone: '01050244636',
    isLunar: false,
    isLeafMonth: false,
    birth: '1998-04-08T00:54:30.000Z',
    birthdayMMDD: '04-08',
    gender: null,
    address: null,
    detailAddress: null,
    homePhone: null,
    occupation: null,
    school: null,
    marriage: null,
    marriageDetail: null,
    vehicleNumber: ['1234', '141부5432'],
    guidedById: null,
    baptism: 'none',
    ministryGroupRole: 'leader',
    officerId: 9,
    groupId: 2,
    groupRole: 'member',
    group: {
      id: 2,
      name: '그룹2-1',
    },
    officer: {
      id: 9,
      name: '목회자',
    },
    guidedBy: null,
    officerHistory: [
      {
        id: 15,
        startDate: '2025-07-24T15:00:00.000Z',
      },
    ],
    groupHistory: [
      {
        id: 35,
        groupId: 2,
        startDate: '2025-07-26T15:00:00.000Z',
        groupDetailHistory: [],
      },
    ],
    ministryGroupHistory: [
      {
        id: 71,
        ministryGroupId: 1,
        startDate: '2025-06-30T15:00:00.000Z',
        ministryGroup: {
          id: 1,
          name: '사역그룹1',
        },
        ministryGroupDetailHistory: [
          {
            id: 24,
            startDate: '2025-06-30T15:00:00.000Z',
            role: 'leader',
          },
          {
            id: 23,
            startDate: '2025-07-20T15:00:00.000Z',
            ministry: {
              id: 2,
              name: '기타',
            },
          },
        ],
      },
    ],
    isConcealed: false,
  },
  timestamp: '2025-08-12T15:51:58.773Z',
};
