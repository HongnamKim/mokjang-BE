import { IsNumber } from 'class-validator';

export class SignInChurchDto {
  @IsNumber()
  churchId: number;
}
