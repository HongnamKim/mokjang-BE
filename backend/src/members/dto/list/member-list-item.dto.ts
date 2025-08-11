// 조회한 교인 개별 데이터
import { Marriage } from '../../const/enum/marriage.enum';
import { Gender } from '../../const/enum/gender.enum';

export class MemberListItemDto {
  id: number;
  name: string;
  profileImage?: string;

  // Optional fields based on displayColumns
  officer?: {
    id: number;
    name: string;
  };
  group?: {
    id: number;
    name: string;
  };
  birth?: Date;
  isLunar?: boolean;
  isLeafMonth?: boolean;
  mobilePhone?: string;
  homePhone?: string;
  address?: string;
  school?: string;
  marriage?: Marriage; // 'married' | 'single'
  occupation?: string;
  baptism?: string;
  gender?: Gender; // 'male' | 'female'
  vehicleNumber?: string[];
  updatedAt?: Date;
  registeredAt?: Date;
}
