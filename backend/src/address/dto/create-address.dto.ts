import {
  IsBoolean,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ description: 'Name of the receiver', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  receiverName: string;

  @ApiProperty({ description: 'Phone number in Vietnam format', example: '+84901234567' })
  @IsPhoneNumber('VN')
  phone: string;

  @ApiProperty({ description: 'Province name', example: 'Ho Chi Minh City' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  province: string;

  @ApiProperty({ description: 'District name', example: 'District 1' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  district: string;

  @ApiProperty({ description: 'Ward name', example: 'Ben Nghe Ward' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  ward: string;

  @ApiProperty({
    description: 'Specific address details',
    example: '123 Nguyen Hue St',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  specificAddress: string;

  @ApiProperty({ description: 'Is this the default address', example: false })
  @IsBoolean()
  isDefault: boolean = false;
}
