import { IsEmail, IsNotEmpty, MaxLength, MinLength, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'User full name',
    type: 'string',
    minLength: 6,
    maxLength: 255,
    example: 'John Doe',
  })
  @IsOptional()
  @IsNotEmpty({ message: 'Full name cannot be empty' })
  @MinLength(6, {
    message: 'Full name min length must be at least 6 characters',
  })
  @MaxLength(255, { message: 'Full name max length must be 255 characters' })
  fullName?: string;

  @ApiPropertyOptional({
    description: 'User email address',
    type: 'string',
    format: 'email',
    example: 'john@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'User password',
    type: 'string',
    minLength: 6,
    maxLength: 80,
    example: 'Password123',
  })
  @IsOptional()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, {
    message: 'Password min length must be at least 6 characters',
  })
  @MaxLength(80, { message: 'Password max length must be 255 characters' })
  password?: string;

  @ApiPropertyOptional({
    description: 'User image',
    type: 'string',
    example: 'https://example.com/image.jpg',
  })
  @IsOptional()
  @IsString()
  image?: string;
}
