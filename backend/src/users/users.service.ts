import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, IsNull, ILike } from 'typeorm';
import bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { I18nContext } from 'nestjs-i18n';
import { BaseService } from 'src/common/base.service';
import {
  PaginatedResponse,
  PaginationRequest,
} from 'src/common/dto/paginate.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { UserMapper } from './users.mapper';

@Injectable()
export class UsersService extends BaseService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    super();
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOneBy({ email: email });
  }

  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findOneBy({ id: id });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return await this.userRepository.findOneBy({ resetPasswordToken: token });
  }

  async update(id: number, user: Partial<Omit<User, 'id'>>) {
    return await this.userRepository.update(id, user);
  }

  async create(user: Partial<Omit<User, 'id'>>): Promise<User> {
    const newUser = this.userRepository.create(user);
    const saved = await this.userRepository.save(newUser);
    return saved;
  }

  async getProfile(i18n: I18nContext, userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId, deletedAt: IsNull() },
    });
    if (!user) {
      throw new NotFoundException(i18n.t('common.users.errors.user_not_found'));
    }
    return user;
  }

  async updateProfile(
    i18n: I18nContext,
    userId: number,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.getProfile(i18n, userId);
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateProfileDto.email);
      if (existingUser) {
        throw new BadRequestException(
          i18n.t('common.users.errors.email_already_in_use'),
        );
      }
      user.email = updateProfileDto.email;
    }

    if (updateProfileDto.fullName) {
      user.fullName = updateProfileDto.fullName;
    }

    if (updateProfileDto.password) {
      const hashedPassword = await bcrypt.hash(updateProfileDto.password, 10);
      user.password = hashedPassword;
    }

    if (updateProfileDto.image) {
      user.image = updateProfileDto.image;
    }

    return await this.userRepository.save(user);
  }

  async deleteProfile(i18n: I18nContext, userId: number): Promise<void> {
    const user = await this.getProfile(i18n, userId);
    user.deletedAt = new Date();
    await this.userRepository.save(user);
  }

  async deleteUserById(i18n: I18nContext, id: number): Promise<void> {
    const user = await this.getUserById(i18n, id);
    user.deletedAt = new Date();
    await this.userRepository.save(user);
  }

  async getAllUsers(
    pagination: PaginationRequest,
  ): Promise<PaginatedResponse<UserProfileResponseDto>> {
    return this.paginate<User, UserProfileResponseDto>({
      repository: this.userRepository,
      options: {
        where: { deletedAt: IsNull() },
      },
      pagination,
      mapper: (item: User) => UserMapper.toDto(item),
    });
  }

  async getUserById(i18n: I18nContext, id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: id, deletedAt: IsNull() },
    });
    if (!user) {
      throw new NotFoundException(i18n.t('common.users.errors.user_not_found'));
    }
    return user;
  }

  async updateUser(
    i18n: I18nContext,
    id: number,
    updateUserDto: Partial<User>,
  ): Promise<User> {
    const user = await this.getUserById(i18n, id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new BadRequestException(
          i18n.t('common.users.errors.email_already_in_use'),
        );
      }
      user.email = updateUserDto.email;
    }

    if (updateUserDto.fullName) {
      user.fullName = updateUserDto.fullName;
    }

    if (updateUserDto.password) {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      user.password = hashedPassword;
    }

    if (updateUserDto.role) {
      user.role = updateUserDto.role;
    }

    return await this.userRepository.save(user);
  }

  async searchUsers(
    query: string,
    pagination: PaginationRequest,
  ): Promise<PaginatedResponse<UserProfileResponseDto>> {
    return this.paginate<User, UserProfileResponseDto>({
      repository: this.userRepository,
      options: {
        where: [
          { fullName: ILike(`%${query}%`), deletedAt: IsNull() },
          { email: ILike(`%${query}%`), deletedAt: IsNull() },
        ],
      },
      pagination: pagination,
      mapper: (item: User) => UserMapper.toDto(item),
    });
  }
}
