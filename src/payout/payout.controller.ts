import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PayoutService } from './payout.service';
import { MakeTransferDto } from './dto/make-transfer.dto';

@Controller('payout')
@ApiTags('APIs Payout')
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Post('init')
  @ApiOperation({
    summary: 'Init user payout',
  })
  // @ApiBody({ type: MakeTransferDto })
  @ApiCreatedResponse({ description: 'Payout initiated' })
  async initPayout(@Body() payload: MakeTransferDto) {
    return await this.payoutService.initPayout(payload);
  }

  @Post('debitTransfer')
  @ApiOperation({
    summary: 'Transfer funds',
  })
  @ApiCreatedResponse({ description: 'Transfer debited' })
  async transferDebit(@Body() payload: any) {
    return await this.payoutService.transferDebit(
      payload.transfer,
      payload.transaction,
      payload.historique,
      payload.amount,
      payload.senderInfos,
      payload.fees,
      payload.receiverNumber,
    );
  }

  @Post('execTransfer')
  @ApiOperation({
    summary: 'Execute transfer',
  })
  @ApiCreatedResponse({ description: 'Transfer executed' })
  async sendTransfer(@Body() payload: any) {
    return await this.payoutService.sendTransfer(
      payload.reservation,
      payload.receiverNumber,
      payload.amount,
      payload.transfer,
      payload.transaction,
      payload.fees,
      payload.historique,
    );
  }
}
