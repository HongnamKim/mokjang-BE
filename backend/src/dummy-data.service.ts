import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MembersService } from './churches/members/service/members.service';
import { GenderEnum } from './churches/members/const/enum/gender.enum';
import { MarriageOptions } from './churches/members/const/marriage-options.const';
import { BaptismEnum } from './churches/members/enum/baptism.enum';

@Injectable()
export class DummyDataService {
  constructor(private readonly membersService: MembersService) {}

  createRandomMembers(churchId: number, count: number) {
    const members = Array.from({ length: count }, () => {
      const registeredAt = this.getRandomDate(2010, 2024);
      const name = this.getRandomName();
      const mobilePhone = this.getRandomMobilePhone();
      const birth = this.getRandomDate(1960, 2010);
      const isLunar =
        birth < new Date('1970-01-01') ? Math.random() < 0.3 : false;
      const gender = this.getRandomGender();
      const address = this.generateRandomAddress();
      const detailAddress = this.generateDetailAddress();
      const occupation =
        Math.random() > 0.1 ? this.generateRandomOccupation() : undefined;
      const marriage = this.generateRandomMarriage();
      const baptism = this.generateRandomBaptism();
      const vehicleNumber = this.generateRandomVehicleNumbers();
      const previousChurch = this.generatePreviousChurchName();

      return this.membersService.createMemberModel({
        churchId,
        registeredAt,
        name,
        mobilePhone,
        isLunar,
        birth,
        gender,
        address,
        detailAddress,
        occupation,
        marriage,
        baptism,
        vehicleNumber,
        previousChurch,
      });
    });

    try {
      return this.membersService.createMultipleMembers(churchId, members);
    } catch (e) {
      throw new InternalServerErrorException(
        '더미 데이터 생성 중 문제가 발생했습니다.',
      );
    }
  }

  private getRandomDate(startYear: number, endYear: number): Date {
    const start = new Date(startYear.toString()).getTime();
    const end = new Date(`${endYear}-12-31`).getTime();

    const randomTimeStamp = Math.random() * (end - start) + start;

    return new Date(randomTimeStamp);
  }

  private getRandomName() {
    const familyNames = [
      '김',
      '이',
      '박',
      '최',
      '정',
      '강',
      '조',
      '윤',
      '장',
      '임',
      '한',
      '오',
      '서',
      '신',
      '권',
      '황',
      '안',
      '송',
      '류',
      '전',
    ];
    const firstNameParts = [
      '준',
      '민',
      '서',
      '지',
      '현',
      '우',
      '동',
      '혁',
      '성',
      '영',
      '수',
      '희',
      '은',
      '진',
      '아',
      '승',
      '윤',
      '정',
      '주',
      '연',
      '태',
      '경',
      '재',
      '원',
      '종',
      '훈',
    ];

    const familyName =
      familyNames[Math.floor(Math.random() * familyNames.length)];
    const firstName1 =
      firstNameParts[Math.floor(Math.random() * firstNameParts.length)];
    const firstName2 =
      firstNameParts[Math.floor(Math.random() * firstNameParts.length)];

    return `${familyName}${firstName1}${firstName2}`;
  }

  private getRandomMobilePhone() {
    const prefix = '010';

    const middle = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');

    const last = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');

    return `${prefix}${middle}${last}`;
  }

  private getRandomGender() {
    const num = Math.random();

    return num > 0.5 ? GenderEnum.male : GenderEnum.female;
  }

  generateRandomAddress(): string {
    // 인천 지역
    const incheonDistricts = [
      '미추홀구',
      '연수구',
      '남동구',
      '부평구',
      '계양구',
      '서구',
      '동구',
      '중구',
    ];
    const incheonRoads = [
      '인주대로',
      '매소홀로',
      '경원대로',
      '청라대로',
      '연수대로',
      '미추홀대로',
      '길주로',
      '봉수대로',
      '연남로',
    ];

    // 부천 지역
    const bucheonDistricts = ['원미구', '소사구', '오정구'];
    const bucheonRoads = [
      '부일로',
      '소사로',
      '부천로',
      '옥길로',
      '심곡로',
      '경인로',
      '소새울로',
      '원미로',
    ];

    // 도시 선택 (인천 또는 부천)
    const isIncheon = Math.random() > 0.7; // 70% 확률로 부천

    if (isIncheon) {
      const district =
        incheonDistricts[Math.floor(Math.random() * incheonDistricts.length)];
      const road =
        incheonRoads[Math.floor(Math.random() * incheonRoads.length)];
      const buildingNumber = Math.floor(Math.random() * 500) + 1;

      return `인천 ${district} ${road} ${buildingNumber}`;
    } else {
      const district =
        bucheonDistricts[Math.floor(Math.random() * bucheonDistricts.length)];
      const road =
        bucheonRoads[Math.floor(Math.random() * bucheonRoads.length)];
      const buildingNumber = Math.floor(Math.random() * 300) + 1;

      return `경기 부천시 ${district} ${road} ${buildingNumber}`;
    }
  }

  generateDetailAddress(): string {
    const dong = Math.floor(Math.random() * 1500) + 1;
    const ho = Math.floor(Math.random() * 1500) + 1;

    return `${dong}동 ${ho}호`;
  }

  generateRandomOccupation(): string {
    const occupations = [
      // 전문직
      '의사',
      '변호사',
      '약사',
      '회계사',
      '건축사',

      // 회사원
      '회사원',
      '은행원',
      '공무원',
      '사무직',
      '영업직',
      '인사담당자',
      '마케팅팀장',
      '기획자',

      // IT
      '프로그래머',
      '웹개발자',
      '시스템엔지니어',
      'DB관리자',
      'UX디자이너',

      // 교육
      '교사',
      '교수',
      '학원강사',
      '보육교사',
      '특수교사',

      // 서비스
      '요리사',
      '미용사',
      '부동산중개사',
      '보험설계사',
      '간호사',

      // 자영업
      '자영업자',
      '음식점운영',
      '카페운영',
      '슈퍼마켓운영',
      '온라인쇼핑몰운영',

      // 프리랜서/예술
      '프리랜서',
      '작가',
      '디자이너',
      '예술가',
      '연구원',

      // 무급/봉사 활동
      '주부',
      '전업주부',
      '학생',
      '대학생',
      '취업준비생',
      '자원봉사자',
      '시민단체활동가',

      // 은퇴/기타
      '무직',
      '은퇴',
      '프리랜서',
      '아르바이트',
    ];

    return occupations[Math.floor(Math.random() * occupations.length)];
  }

  generateRandomMarriage() {
    return Math.random() > 0.6
      ? MarriageOptions.marriage
      : MarriageOptions.unMarriage;
  }

  generateRandomBaptism() {
    const baptisms = [
      BaptismEnum.baptized,
      BaptismEnum.immersionBaptism,
      BaptismEnum.infantBaptism,
      BaptismEnum.confirmation,
      BaptismEnum.catechumenate,
      BaptismEnum.default,
    ];

    return baptisms[Math.floor(Math.random() * baptisms.length)];
  }

  generateRandomVehicleNumbers(min: number = 1, max: number = 3): string[] {
    // 배열 길이 랜덤 생성 (1~3)
    const length = Math.floor(Math.random() * (max - min + 1)) + min;

    // 중복되지 않는 차량번호 생성
    const numbers = new Set<string>();

    if (Math.random() > 0.5) {
      return Array.from(numbers);
    }

    while (numbers.size < length) {
      const number = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');
      numbers.add(number);
    }

    return Array.from(numbers);
  }

  generatePreviousChurchName(): string | undefined {
    // 85% 확률로 null 반환
    if (Math.random() > 0.15) {
      return undefined;
    }

    const churchNames = [
      '사랑의교회',
      '은혜교회',
      '믿음교회',
      '소망교회',
      '축복교회',
      '성광교회',
      '중앙교회',
      '신일교회',
      '제일교회',
      '한빛교회',
      '새생명교회',
      '복된교회',
      '평화교회',
      '영광교회',
      '생명교회',
    ];

    return churchNames[Math.floor(Math.random() * churchNames.length)];
  }
}
