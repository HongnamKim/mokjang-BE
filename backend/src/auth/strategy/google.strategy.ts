import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { OauthDto } from '../dto/auth/oauth.dto';
import { GOOGLE_OAUTH } from '../const/env.const';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>(GOOGLE_OAUTH.GOOGLE_CLIENT_ID),
      clientSecret: configService.getOrThrow<string>(
        GOOGLE_OAUTH.GOOGLE_CLIENT_SECRET,
      ),
      callbackURL: configService.getOrThrow<string>(
        GOOGLE_OAUTH.GOOGLE_CALLBACK_URL,
      ),
      scope: ['profile', 'email'],
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
