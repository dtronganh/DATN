import { User } from './entities/user.entity';

export class UserMapper {
  static toDto(userProfile: User) {
    return {
      id: userProfile.id,
      email: userProfile.email,
      fullName: userProfile.fullName,
      image: userProfile.image,
      role: userProfile.role,
      createdAt: userProfile.createdAt,
      updatedAt: userProfile.updatedAt,
    };
  }
}
