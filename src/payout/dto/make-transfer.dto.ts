import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MakeTransferDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  amount: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  senderPhoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  receiverPhoneNumber: string;
}
