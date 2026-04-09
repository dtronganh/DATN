import { Injectable } from '@nestjs/common';
import { Address } from 'src/address/entities/address.entity';

@Injectable()
export class FormattingService {
  formatAddress(address: Address): string {
    return `${address.specificAddress}, ${address.ward}, ${address.district}, ${address.province}`;
  }
}
