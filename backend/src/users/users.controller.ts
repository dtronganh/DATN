import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RoleGuards } from 'src/auth/guards/roles.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Payload } from 'src/common/payload';
import { UserMapper } from './users.mapper';
import { Role } from './entities/user.entity';
import { PaginatedResponse } from 'src/common/dto/paginate.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(
    @I18n() i18n: I18nContext,
    @GetUser() payload: Payload,
  ): Promise<UserProfileResponseDto> {
    const userProfile = await this.usersService.getProfile(i18n, payload.userId);
    return UserMapper.toDto(userProfile);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    type: UserProfileResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @I18n() i18n: I18nContext,
    @GetUser() payload: Payload,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<UserProfileResponseDto> {
    const updatedUser = await this.usersService.updateProfile(
      i18n,
      payload.userId,
      updateProfileDto,
    );
    return UserMapper.toDto(updatedUser);
  }

  @Delete('profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete current user account' })
  @ApiResponse({ status: 204, description: 'User account deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteProfile(
    @I18n() i18n: I18nContext,
    @GetUser() payload: Payload,
  ): Promise<void> {
    await this.usersService.deleteProfile(i18n, payload.userId);
  }

  @Get('search')
  @UseGuards(RoleGuards)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Search users by name or email (Admin only)' })
  @ApiQuery({ name: 'query', type: String, required: true, description: 'Search term' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Search results',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async searchUsers(
    @Query('query') query: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('sort') sort?: string,
  ): Promise<PaginatedResponse<UserProfileResponseDto>> {
    return this.usersService.searchUsers(query, { page, limit, sort });
  }

  @Get()
  @UseGuards(RoleGuards)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAllUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('sort') sort?: string,
  ): Promise<PaginatedResponse<UserProfileResponseDto>> {
    return this.usersService.getAllUsers({ page, limit, sort });
  }

  @Get(':id')
  @UseGuards(RoleGuards)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'User ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(
    @I18n() i18n: I18nContext,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserProfileResponseDto> {
    const user = await this.usersService.getUserById(i18n, id);
    return UserMapper.toDto(user);
  }

  @Patch(':id')
  @UseGuards(RoleGuards)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update user by ID (Admin only)' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'User ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserProfileResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @I18n() i18n: I18nContext,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserProfileResponseDto> {
    const updatedUser = await this.usersService.updateUser(
      i18n,
      id,
      updateUserDto,
    );
    return UserMapper.toDto(updatedUser);
  }

  @Delete(':id')
  @UseGuards(RoleGuards)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user by ID (Admin only)' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'User ID',
    example: 1,
  })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(
    @I18n() i18n: I18nContext,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.usersService.deleteUserById(i18n, id);
  }
}
