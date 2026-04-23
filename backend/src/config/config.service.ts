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

  get aiApiKey(): string {
    return this.config.getOrThrow<string>('AI_API_KEY');
  }

  get aiBaseUrl(): string {
    return this.config.getOrThrow<string>('AI_BASE_URL');
  }

  get aiModel(): string {
    return this.config.getOrThrow<string>('AI_MODEL');
  }

  get vnpayTmnCode(): string {
    return this.config.getOrThrow<string>('VNPAY_TMN_CODE');
  }

  get vnpaySecureSecret(): string {
    return this.config.getOrThrow<string>('VNPAY_SECURE_SECRET');
  }

  get vnpayUrl(): string {
    return this.config.getOrThrow<string>('VNPAY_URL');
  }

  get vnpayReturnUrl(): string {
    return this.config.getOrThrow<string>('VNPAY_RETURN_URL');
  }

  get vnpayFrontendRedirectBaseUrl(): string {
    return this.config.getOrThrow<string>('VNPAY_FRONTEND_REDIRECT_BASE_URL');
  }
}
