import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-naver';
import { ConfigService } from '@nestjs/config';
import { OauthDto } from '../dto/auth/oauth.dto';
import { NAVER_OAUTH } from '../const/env.const';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>(NAVER_OAUTH.NAVER_CLIENT_ID),
      clientSecret: configService.getOrThrow<string>(
        NAVER_OAUTH.NAVER_CLIENT_SECRET,
      ),
      callbackURL: configService.getOrThrow<string>(
        NAVER_OAUTH.NAVER_CALLBACK_URL,
      ),
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): OauthDto {
    return new OauthDto(profile.provider, profile.id);
  }
}
