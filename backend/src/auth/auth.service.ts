import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Role, User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import bcrypt from 'bcrypt';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginRequestDto } from './dto/login-request.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { RegisterRequestDto } from './dto/register-request.dto';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { StringValue } from 'ms';
import { AppConfigService } from 'src/config/config.service';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: AppConfigService,
  ) {}

  async validateUser(
    i18n: I18nContext,
    { email, password }: LoginRequestDto,
  ): Promise<User> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException(
        i18n.t('common.auth.errors.invalid_credentials'),
      );
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new UnauthorizedException(
        i18n.t('common.auth.errors.invalid_credentials'),
      );
    }
    return user;
  }

  async login(user: User): Promise<LoginResponseDto> {
    const payload = { sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.jwtAccessToken,
      expiresIn: this.configService.jwtAccessTokenExpiresIn as StringValue,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.jwtRefreshToken,
      expiresIn: this.configService.jwtRefreshTokenExpiresIn as StringValue,
    });
    await this.updateRefreshToken(user.id, refreshToken);
    return {
      accessToken,
      refreshToken,
    };
  }

  private async updateRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.userService.update(userId, { refreshToken: hash });
  }

  async refreshTokens(
    i18n: I18nContext,
    userId: number,
    refreshToken: string,
  ): Promise<RefreshResponseDto> {
    const user = await this.userService.findById(userId);
    if (!user || !user.refreshToken) {
      throw new ForbiddenException(i18n.t('common.auth.errors.access_denied'));
    }
    const match = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!match) {
      throw new ForbiddenException(i18n.t('common.auth.errors.access_denied'));
    }
    return this.login(user);
  }

  async register(
    i18n: I18nContext,
    { email, password, fullName }: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    const existedUser = await this.userService.findByEmail(email);
    if (existedUser) {
      throw new ConflictException(
        i18n.t('common.auth.errors.email_already_in_use'),
      );
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await this.userService.create({
      email: email,
      password: hash,
      fullName: fullName,
      role: Role.USER,
    });
    return await this.login(user);
  }

  async logout(userId: number): Promise<void> {
    await this.userService.update(userId, { refreshToken: null });
  }
}
