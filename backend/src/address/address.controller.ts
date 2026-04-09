import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AddressResponseDto } from './dto/address-response.dto';
import { PaginatedAddressResponseDto } from './dto/paginated-address-response.dto';
import { PaginatedResponse } from 'src/common/dto/paginate.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Payload } from 'src/common/payload';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RoleGuards } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/entities/user.entity';
import { I18n, I18nContext } from 'nestjs-i18n';

@ApiTags('addresses')
@ApiBearerAuth()
@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user addresses with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'List of addresses',
    type: PaginatedAddressResponseDto,
  })
  @UseGuards(JwtAuthGuard, RoleGuards)
  @Roles(Role.USER)
  async getAddresses(
    @GetUser() payload: Payload,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('sort') sort?: string,
  ): Promise<PaginatedResponse<AddressResponseDto>> {
    return this.addressService.getAddresses(payload, { page, limit, sort });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get address by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Address ID' })
  @ApiResponse({
    status: 200,
    description: 'Address found',
    type: AddressResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Address not found' })
  @UseGuards(JwtAuthGuard, RoleGuards)
  @Roles(Role.USER)
  async findOne(
    @I18n() i18n: I18nContext,
    @GetUser() payload: Payload,
    @Param('id') id: string,
  ): Promise<AddressResponseDto> {
    return this.addressService.findOne(i18n, payload, +id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  @ApiResponse({
    status: 201,
    description: 'Address created',
    type: AddressResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @UseGuards(JwtAuthGuard, RoleGuards)
  @Roles(Role.USER)
  async create(
    @GetUser() payload: Payload,
    @Body() createAddressDto: CreateAddressDto,
  ): Promise<AddressResponseDto> {
    return this.addressService.create(payload, createAddressDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update address by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Address ID' })
  @ApiResponse({
    status: 200,
    description: 'Address updated',
    type: AddressResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Address not found' })
  @UseGuards(JwtAuthGuard, RoleGuards)
  @Roles(Role.USER)
  async update(
    @I18n() i18n: I18nContext,
    @GetUser() payload: Payload,
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ): Promise<AddressResponseDto> {
    return this.addressService.update(i18n, payload, +id, updateAddressDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete address by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Address ID' })
  @ApiResponse({
    status: 200,
    description: 'Address deleted',
    type: AddressResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Address not found' })
  @UseGuards(JwtAuthGuard, RoleGuards)
  @Roles(Role.USER)
  async remove(
    @I18n() i18n: I18nContext,
    @GetUser() payload: Payload,
    @Param('id') id: string,
  ): Promise<AddressResponseDto> {
    return this.addressService.remove(i18n, payload, +id);
  }
}
