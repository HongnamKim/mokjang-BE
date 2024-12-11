import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID:
        '660669833667-ph0nchsue1n67k48qi8fdf5pl16dr8jm.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: '/auth/google/redirect',
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<any> {
    return {
      providerId: profile.id,
      provider: profile.provider,
      nickname: profile.displayName,
      email: profile.emails,
    };
  }
}
