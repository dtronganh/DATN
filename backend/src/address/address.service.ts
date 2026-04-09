import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { BaseService } from 'src/common/base.service';
import {
  PaginatedResponse,
  PaginationRequest,
} from 'src/common/dto/paginate.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { DataSource, IsNull, Not, Repository } from 'typeorm';
import { AddressResponseDto } from './dto/address-response.dto';
import { Payload } from 'src/common/payload';
import { AddressMapper } from './address.mapper';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class AddressService extends BaseService {
  constructor(
    @InjectRepository(Address) private addressRepository: Repository<Address>,
    private dataSource: DataSource,
  ) {
    super();
  }

  async getAddresses(
    user: Payload,
    request: PaginationRequest,
  ): Promise<PaginatedResponse<AddressResponseDto>> {
    return await this.paginate<Address, AddressResponseDto>({
      repository: this.addressRepository,
      options: {
        where: {
          user: {
            id: user.userId,
            deletedAt: IsNull(),
          },
          deletedAt: IsNull(),
        },
      },
      pagination: request,
      mapper: AddressMapper.toDto,
    });
  }

  async findOne(
    i18n: I18nContext,
    user: Payload,
    id: number,
  ): Promise<AddressResponseDto> {
    const address = await this.addressRepository.findOneBy({
      deletedAt: IsNull(),
      id: id,
      user: {
        id: user.userId,
      },
    });
    if (address === null) {
      throw new NotFoundException(i18n.t('common.address.errors.not_found'));
    }
    return AddressMapper.toDto(address);
  }

  async create(
    user: Payload,
    createAddressDto: CreateAddressDto,
  ): Promise<AddressResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const addressRepo = manager.getRepository(Address);
      if (createAddressDto.isDefault) {
        await addressRepo.update(
          {
            user: { id: user.userId, deletedAt: IsNull() },
            deletedAt: IsNull(),
            isDefault: true,
          },
          { isDefault: false },
        );
      }
      const address = addressRepo.create({
        ...createAddressDto,
        user: { id: user.userId },
      });
      const saved = await addressRepo.save(address);
      return AddressMapper.toDto(saved);
    });
  }

  async update(
    i18n: I18nContext,
    user: Payload,
    id: number,
    updateAddressDto: UpdateAddressDto,
  ): Promise<AddressResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const addressRepo = manager.getRepository(Address);
      const address = await addressRepo.findOne({
        where: { id: id, deletedAt: IsNull() },
      });
      if (address === null) {
        throw new NotFoundException(i18n.t('common.address.errors.not_found'));
      }
      if (updateAddressDto.isDefault) {
        await addressRepo.update(
          {
            user: { id: user.userId, deletedAt: IsNull() },
            deletedAt: IsNull(),
            isDefault: true,
          },
          { isDefault: false },
        );
      }
      await addressRepo.update(id, updateAddressDto);
      const updated = await addressRepo.findOneBy({ id });
      return AddressMapper.toDto(updated!);
    });
  }

  async remove(
    i18n: I18nContext,
    user: Payload,
    id: number,
  ): Promise<AddressResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const addressRepo = manager.getRepository(Address);
      const address = await addressRepo.findOne({
        where: { id: id, deletedAt: IsNull() },
      });
      if (address === null) {
        throw new NotFoundException(i18n.t('common.address.errors.not_found'));
      }
      if (address.isDefault) {
        const newAddress = await addressRepo.findOne({
          where: {
            user: { id: user.userId, deletedAt: IsNull() },
            deletedAt: IsNull(),
            isDefault: false,
            id: Not(id),
          },
          order: {
            createdAt: 'ASC',
          },
        });
        if (newAddress !== null) {
          addressRepo.update(newAddress.id, { isDefault: true });
        }
      }
      await addressRepo.update(id, { deletedAt: new Date() });
      return AddressMapper.toDto(address);
    });
  }
}
