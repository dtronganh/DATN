import { AddressResponseDto } from './dto/address-response.dto';
import { Address } from './entities/address.entity';

export class AddressMapper {
  static toDto(address: Address): AddressResponseDto {
    return {
      id: address.id,
      receiverName: address.receiverName,
      phone: address.phone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      specificAddress: address.specificAddress,
      isDefault: address.isDefault,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
    };
  }
}
