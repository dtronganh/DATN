import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password (min 6, max 80 characters)' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, {
    message: 'Password min length must be at least 6 characters',
  })
  @MaxLength(80, { message: 'Password max length must be 255 characters' })
  password: string;
}
