import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  bucheonDistricts,
  bucheonRoads,
  churchNames,
  familyNames,
  firstNameParts,
  incheonDistricts,
  incheonRoads,
  occupations,
} from './const/dummy-data/dummy-member.const';
import { GenderEnum } from './members/const/enum/gender.enum';
import { MarriageOptions } from './members/member-domain/const/marriage-options.const';
import { BaptismEnum } from './members/const/enum/baptism.enum';
import {
  IDUMMY_MEMBERS_DOMAIN_SERVICE,
  IDummyMembersDomainService,
} from './members/member-domain/interface/dummy-members-domain.service.interface';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from './churches/churches-domain/interface/churches-domain.service.interface';

@Injectable()
export class DummyDataService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IDUMMY_MEMBERS_DOMAIN_SERVICE)
    private readonly dummyMembersDomainService: IDummyMembersDomainService,
  ) {}

  async createRandomMembers(churchId: number, count: number) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

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

      return this.dummyMembersDomainService.createDummyMemberModel({
        churchId: church.id,
        utcRegisteredAt: registeredAt,
        name,
        mobilePhone,
        isLunar,
        utcBirth: birth,
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
      const result =
        await this.dummyMembersDomainService.createDummyMembers(members);
      await this.churchesDomainService.dummyMemberCount(church, count);

      return result;
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

  private generateRandomAddress(): string {
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

  private generateDetailAddress(): string {
    const dong = Math.floor(Math.random() * 1500) + 1;
    const ho = Math.floor(Math.random() * 1500) + 1;

    return `${dong}동 ${ho}호`;
  }

  private generateRandomOccupation(): string {
    return occupations[Math.floor(Math.random() * occupations.length)];
  }

  private generateRandomMarriage() {
    return Math.random() > 0.6
      ? MarriageOptions.Married
      : MarriageOptions.Single;
  }

  private generateRandomBaptism() {
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

  private generateRandomVehicleNumbers(
    min: number = 1,
    max: number = 3,
  ): string[] {
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

  private generatePreviousChurchName(): string | undefined {
    // 85% 확률로 null 반환
    if (Math.random() > 0.15) {
      return undefined;
    }

    return churchNames[Math.floor(Math.random() * churchNames.length)];
  }
}
