import { Module } from '@nestjs/common';
import { PayoutController } from './payout.controller';
import { PayoutService } from './payout.service';
import { AdministrationModule } from 'libs/administration/src/administration.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payout } from './entities/payout.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payout]), AdministrationModule],
  controllers: [PayoutController],
  providers: [PayoutService],
})
export class PayoutModule {}
