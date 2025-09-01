import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionPlan } from '../../const/subscription-plan.enum';
import { IsBoolean, IsEnum } from 'class-validator';
import { IsAvailablePlan } from '../../decorator/is-available-plan.decorator';
import { BillingCycle } from '../../const/billing-cycle.enum';

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
}
