import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionPlan } from '../../const/subscription-plan.enum';
import {
  IsBoolean,
  IsEnum,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { IsAvailablePlan } from '../../decorator/is-available-plan.decorator';
import { BillingCycle } from '../../const/billing-cycle.enum';
import { Type } from 'class-transformer';

export class EncData {
  @ApiProperty({
    description: '카드번호, 숫자만 입력',
    example: '1234123412341234',
  })
  @IsString()
  @Length(16, 16)
  cardNo: string;

  @ApiProperty({
    description: '유효기간(년, YY)',
    example: '25',
  })
  @IsString()
  @Length(2, 2)
  expYear: string;

  @ApiProperty({
    description: '유효기간(월, MM)',
    example: '09',
  })
  @IsString()
  @Length(2, 2)
  expMonth: string;

  @ApiProperty({
    description: '생년월일(YYMMDD) or 사업자번호(10자리)',
    example: '000101',
  })
  @IsString()
  @Length(6, 10)
  idNo: string;

  @ApiProperty({
    description: '카드 비밀번호 앞 2자리',
    example: '00',
  })
  @IsString()
  @Length(2, 2)
  cardPw: string;
}

export class SubscribePlanDto {
  @ApiProperty({ description: '테스트용', default: true, example: true })
  @IsBoolean()
  isTest: boolean = true;

  @ApiProperty({
    description: '구독 플랜 (freeTrial, basic, standard, plus, premium)',
    enum: SubscriptionPlan,
    example: SubscriptionPlan.BASIC,
  })
  @IsAvailablePlan([SubscriptionPlan.FREE_TRIAL, SubscriptionPlan.ENTERPRISE])
  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;

  @ApiProperty({
    description: '구독 단위 (월간/연간)',
    enum: BillingCycle,
  })
  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;

  @ApiProperty()
  @Type(() => EncData)
  @ValidateNested()
  encData: EncData;
}
