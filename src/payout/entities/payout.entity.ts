import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TransactionsStatus } from '../enums/transactions-status.enum';

@Entity({
  name: 'payout',
})
export class Payout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  amount: string;

  @Column({ name: 'amount_before_sending' })
  amountBeforeSending: string;

  @Column({ name: 'amount_after_sending' })
  amountAfterSending: string;

  @Column({ name: 'sender_phone_number' })
  senderPhoneNumber: string;

  @Column()
  reference: string;

  @Column({ name: 'receiver_phone_number' })
  receiverPhoneNumber: string;

  @Column({ name: 'fees' })
  fees: string;

  @Column({
    type: 'enum',
    enum: TransactionsStatus,
    default: TransactionsStatus.PENDING,
  })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
