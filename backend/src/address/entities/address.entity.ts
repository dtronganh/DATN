import { BaseEntity } from 'src/common/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

@Entity('address')
export class Address extends BaseEntity {
  @Column({
    name: 'receiver_name',
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: false,
  })
  receiverName: string;

  @Column({
    name: 'phone',
    type: 'varchar',
    length: 50,
    nullable: false,
    unique: false,
  })
  phone: string;

  @Column({
    name: 'province',
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: false,
  })
  province: string;

  @Column({
    name: 'district',
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: false,
  })
  district: string;

  @Column({
    name: 'ward',
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: false,
  })
  ward: string;

  @Column({
    name: 'specific_address',
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: false,
  })
  specificAddress: string;

  @Column({
    name: 'is_default',
    type: 'boolean',
    nullable: false,
    unique: false,
    default: false,
  })
  isDefault: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: User;
}
