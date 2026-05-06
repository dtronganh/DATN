import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/login-request.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterRequestDto } from './dto/register-request.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { ForgotPasswordRequestDto } from './dto/forgot-password-request.dto';
import { ResetPasswordRequestDto } from './dto/reset-password-request.dto';
import { GetUser } from './decorators/get-user.decorator';
import { Payload } from 'src/common/payload';
import { RefreshAuthGuard } from './guards/refresh.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RefreshRequestDto } from './dto/refresh-request.dto';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { I18n, I18nContext } from 'nestjs-i18n';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Post('login')
  async login(
    @I18n() i18n: I18nContext,
    @Body() request: LoginRequestDto,
  ): Promise<LoginResponseDto> {
    const user = await this.authService.validateUser(i18n, request);
    return await this.authService.login(user);
  }

  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({
    status: 201,
    description: 'Registration successful',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or user already exists',
  })
  @Post('register')
  async register(
    @I18n() i18n: I18nContext,
    @Body() request: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    return await this.authService.register(i18n, request);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@GetUser() payload: Payload): Promise<void> {
    return await this.authService.logout(payload.userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refresh successful',
    type: RefreshResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized or invalid refresh token',
  })
  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  async refresh(
    @I18n() i18n: I18nContext,
    @GetUser() payload: Payload,
    @Body() request: RefreshRequestDto,
  ): Promise<RefreshResponseDto> {
    return await this.authService.refreshTokens(
      i18n,
      payload.userId,
      request.refreshToken,
    );
  }

  @ApiOperation({ summary: 'Request password reset email' })
  @ApiResponse({ status: 201, description: 'Reset email sent successfully' })
  @Post('forgot-password')
  async forgotPassword(
    @I18n() i18n: I18nContext,
    @Body() request: ForgotPasswordRequestDto,
  ): Promise<void> {
    return await this.authService.forgotPassword(i18n, request);
  }

  @ApiOperation({ summary: 'Reset password using token' })
  @ApiResponse({ status: 201, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  @Post('reset-password')
  async resetPassword(
    @I18n() i18n: I18nContext,
    @Body() request: ResetPasswordRequestDto,
  ): Promise<void> {
    return await this.authService.resetPassword(i18n, request);
  }
}
