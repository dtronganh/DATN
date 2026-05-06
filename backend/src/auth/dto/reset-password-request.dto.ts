import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordRequestDto {
  @ApiProperty({
    description: 'Reset password token received from email',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'New password (min 6 chars)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
