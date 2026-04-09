import { ApiProperty } from '@nestjs/swagger';

export class UserProfileResponseDto {
  @ApiProperty({
    description: 'User ID',
    type: 'number',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'User email address',
    type: 'string',
    format: 'email',
    example: 'john@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User full name',
    type: 'string',
    example: 'John Doe',
  })
  fullName: string;

  @ApiProperty({
    description: 'User image',
    type: 'string',
    example: 'https://example.com/image.png',
    nullable: true,
  })
  image: string | null;

  @ApiProperty({
    description: 'User role',
    type: 'string',
    example: 'user',
  })
  role: string;

  @ApiProperty({
    description: 'User account creation timestamp',
    type: 'string',
    format: 'date-time',
    example: '2024-01-22T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'User last update timestamp',
    type: 'string',
    format: 'date-time',
    example: '2024-01-22T10:30:00Z',
  })
  updatedAt: Date;
}
