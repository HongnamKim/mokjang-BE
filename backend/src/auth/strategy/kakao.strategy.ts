import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-kakao';
import { ConfigService } from '@nestjs/config';
import { OauthDto } from '../dto/auth/oauth.dto';
import { KAKAO_OAUTH } from '../const/env.const';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>(KAKAO_OAUTH.KAKAO_CLIENT_ID),
      clientSecret: configService.getOrThrow<string>(
        KAKAO_OAUTH.KAKAO_CLIENT_SECRET,
      ),
      callbackURL: configService.getOrThrow<string>(
        KAKAO_OAUTH.KAKAO_CALLBACK_URL,
      ),
    });
  }

  validate(accessToken: string, refreshToken: string, profile: Profile) {
    return new OauthDto(profile.provider, profile.id);
  }
}
