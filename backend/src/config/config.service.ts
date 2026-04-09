import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) {}

  get nodeEnv(): string {
    return this.config.getOrThrow<string>('NODE_ENV');
  }

  get port(): number {
    return this.config.getOrThrow<number>('PORT');
  }

  get jwtAccessToken(): string {
    return this.config.getOrThrow<string>('JWT_ACCESS_TOKEN');
  }

  get jwtRefreshToken(): string {
    return this.config.getOrThrow<string>('JWT_REFRESH_TOKEN');
  }

  get sqliteDbPath(): string {
    return this.config.getOrThrow<string>('SQLITE_DB_PATH');
  }

  get jwtAccessTokenExpiresIn(): string {
    return this.config.getOrThrow<string>('JWT_ACCESS_TOKEN_EXPIRES_IN');
  }

  get jwtRefreshTokenExpiresIn(): string {
    return this.config.getOrThrow<string>('JWT_REFRESH_TOKEN_EXPIRES_IN');
  }
}
