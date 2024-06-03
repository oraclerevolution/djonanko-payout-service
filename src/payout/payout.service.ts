import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payout } from './entities/payout.entity';
import { Repository } from 'typeorm';
import { MakeTransferDto } from './dto/make-transfer.dto';
import { AdministrationService } from 'libs/administration/src/service/administration.service';
import { QueryResponse } from 'src/helper/enums/QueryResponse.enum';
import { TransactionsStatus } from './enums/transactions-status.enum';
import { CreateHistoriqueResultDto } from './dto/create-historique-result.dto';
import { ConfigService } from '@nestjs/config';
import { CollectType } from './enums/collect-type.enum';
@Injectable()
export class PayoutService {
  constructor(
    @InjectRepository(Payout) private readonly repository: Repository<Payout>,
    private readonly administrationService: AdministrationService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Calculates the transaction fees for a given amount.
   *
   * @param {number} amount - The amount for which to calculate the transaction fees.
   * @return {number} - The total amount including the transaction fees.
   */
  getTransactionFees(amount: number, mode: boolean): number {
    if (mode === true) {
      return amount;
    } else {
      const fees = 0.01 * amount;
      return amount + fees;
    }
  }

  /**
   * Generates a random reference string.
   *
   * @return {string} The generated reference string.
   */
  generateReference(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let reference = '';
    for (let i = 0; i < 10; i++) {
      reference += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return `DJONANKO-${reference}`;
  }

  async initPayout(payload: MakeTransferDto) {
    const { senderPhoneNumber, receiverPhoneNumber, amount } = payload;
    const getSenderInfos = await this.administrationService.getUserData(
      process.env.API_KEY_PAYOUT,
      senderPhoneNumber,
    );
    console.log('getSenderInfos', getSenderInfos);

    const getReceiverInfos = await this.administrationService.getUserData(
      process.env.API_KEY_PAYOUT,
      receiverPhoneNumber,
    );
    console.log('getReceiverInfos', getReceiverInfos);

    if (getReceiverInfos === undefined) {
      return {
        transfer: null,
        amount,
        historique: null,
        trnasaction: null,
        fees: null,
        senderInfos: null,
        status: QueryResponse.NOT_FOUND,
        receiverNumber: receiverPhoneNumber,
      };
    } else {
      if (parseInt(getSenderInfos.solde) < parseInt(amount)) {
        const balanceAfterSending =
          parseInt(getSenderInfos.solde) -
          this.getTransactionFees(parseInt(amount), getSenderInfos.premium);
        const payout = new Payout();
        payout.amount = amount;
        if (getSenderInfos.premium === true) {
          payout.fees = '0';
        } else {
          payout.fees = (0.01 * parseInt(amount)).toString();
        }
        payout.amountBeforeSending = getSenderInfos.solde;
        payout.reference = this.generateReference();
        payout.amountAfterSending = balanceAfterSending.toString();
        payout.senderPhoneNumber = senderPhoneNumber;
        payout.receiverPhoneNumber = receiverPhoneNumber;
        payout.status = TransactionsStatus.FAILED;

        const transaction = await this.administrationService.createTransaction(
          process.env.API_KEY_PAYOUT,
          {
            amount,
            amountBeforeSending: getSenderInfos.solde,
            amountAfterSending: balanceAfterSending.toString(),
            senderPhoneNumber: getSenderInfos.numero,
            reference: payout.reference,
            receiverPhoneNumber: getReceiverInfos.numero,
            fees: payout.fees,
            status: 'FAILED',
            type: 'TRANSFERT',
          },
        );

        await this.administrationService.createHistorique(
          process.env.API_KEY_PAYOUT,
          {
            sender: getSenderInfos,
            receiver: getReceiverInfos,
            senderIdentifiant: getSenderInfos.id,
            receiverIdentifiant: getReceiverInfos.id,
            transactionType: 'TRANSFERT',
            referenceTransaction: payout.reference,
            amount,
            fees: payout.fees,
            status: 'FAILED',
            icon: 'send',
          },
        );

        return {
          transfer: payout,
          transaction,
          amount,
          fees: payout.fees,
          senderInfos: getSenderInfos,
          status: QueryResponse.INSUFFICIENT_FUNDS,
        };
      } else if (parseInt(amount) > getSenderInfos.cumulMensuelRestant) {
        const balanceAfterSending =
          parseInt(getSenderInfos.solde) -
          this.getTransactionFees(parseInt(amount), getSenderInfos.premium);
        const payout = new Payout();
        payout.amount = amount;
        if (getSenderInfos.premium === true) {
          payout.fees = '0';
        } else {
          payout.fees = (0.01 * parseInt(amount)).toString();
        }
        payout.amountBeforeSending = getSenderInfos.solde;
        payout.reference = this.generateReference();
        payout.amountAfterSending = balanceAfterSending.toString();
        payout.senderPhoneNumber = senderPhoneNumber;
        payout.receiverPhoneNumber = receiverPhoneNumber;

        const transaction = await this.administrationService.createTransaction(
          process.env.API_KEY_PAYOUT,
          {
            amount,
            amountBeforeSending: getSenderInfos.solde,
            amountAfterSending: balanceAfterSending.toString(),
            senderPhoneNumber: getSenderInfos.numero,
            reference: payout.reference,
            receiverPhoneNumber: getReceiverInfos.numero,
            fees: payout.fees,
            status: 'FAILED',
            type: 'TRANSFERT',
          },
        );

        await this.administrationService.createHistorique(
          process.env.API_KEY_PAYOUT,
          {
            sender: getSenderInfos,
            receiver: getReceiverInfos,
            senderIdentifiant: getSenderInfos.id,
            receiverIdentifiant: getReceiverInfos.id,
            transactionType: 'TRANSFERT',
            referenceTransaction: payout.reference,
            amount,
            fees: payout.fees,
            status: 'FAILED',
            icon: 'send',
          },
        );

        return {
          transfer: payout,
          transaction,
          amount,
          fees: payout.fees,
          senderInfos: getSenderInfos,
          status: QueryResponse.MONTHLY_LIMIT_REACHED,
        };
      } else {
        const balanceAfterSending =
          parseInt(getSenderInfos.solde) -
          this.getTransactionFees(parseInt(amount), getSenderInfos.premium);
        const payout = new Payout();
        payout.amount = amount;
        if (getSenderInfos.premium === true) {
          payout.fees = '0';
        } else {
          payout.fees = (0.01 * parseInt(amount)).toString();
        }
        payout.amountBeforeSending = getSenderInfos.solde;
        payout.reference = this.generateReference();
        payout.amountAfterSending = balanceAfterSending.toString();
        payout.senderPhoneNumber = senderPhoneNumber;
        payout.receiverPhoneNumber = receiverPhoneNumber;
        await this.repository.save(payout);

        let historique: CreateHistoriqueResultDto = null;
        let transaction: any = null;
        if (payout) {
          transaction = await this.administrationService.createTransaction(
            process.env.API_KEY_PAYOUT,
            {
              amount: amount,
              amountBeforeSending: payout.amountBeforeSending,
              amountAfterSending: payout.amountAfterSending,
              senderPhoneNumber: payout.senderPhoneNumber,
              reference: payout.reference,
              receiverPhoneNumber: payout.receiverPhoneNumber,
              fees: payout.fees,
              status: 'PENDING',
              type: 'TRANSFERT',
            },
          );

          historique = await this.createHistorique({
            sender: getSenderInfos,
            receiver: getReceiverInfos,
            senderIdentifiant: getSenderInfos.id,
            receiverIdentifiant: getReceiverInfos.id,
            transactionType: 'TRANSFERT',
            referenceTransaction: payout.reference,
            amount,
            fees: payout.fees,
            status: 'PENDING',
            icon: 'send',
          });
          delete historique.historique.sender;
          delete historique.historique.receiver;
        }

        return {
          transfer: payout,
          amount,
          historique: historique.historique,
          transaction,
          fees: payout.fees,
          senderInfos: getSenderInfos,
          status: TransactionsStatus.SUCCESS,
          receiverNumber: receiverPhoneNumber,
        };
      }
    }
  }

  async transferDebit(
    transfer: Payout,
    transaction: any,
    historique: any,
    amount: string,
    senderInfos: any,
    fees: string,
    receiverNumber: string,
  ) {
    const cost = parseInt(amount) + parseInt(fees);
    const balanceAfterSending = parseInt(senderInfos.solde) - cost;
    if (balanceAfterSending < 0) {
      await this.repository.update(transfer.id, {
        status: 'FAILED',
      });
      await this.administrationService.updateTransaction(
        process.env.API_KEY_PAYOUT,
        transaction.id,
        {
          status: 'FAILED',
        },
      );
      return {
        transfer,
        transaction,
        reservation: null,
        amount,
        receiverNumber,
        senderInfos,
        fees,
        status: QueryResponse.INSUFFICIENT_FUNDS,
      };
    }

    await this.administrationService.updateUser(
      process.env.API_KEY_PAYOUT,
      senderInfos.id,
      {
        solde: balanceAfterSending.toString(),
      },
    );

    const reservation =
      await this.administrationService.createCompteReservation(
        process.env.API_KEY_PAYOUT,
        {
          amount,
          fees,
          fundsToSend: (parseInt(amount) + parseInt(fees)).toString(),
          transactionStatus: 'IN PROGRESS',
          transactionType: 'TRANSFERT',
        },
      );

    if (reservation) {
      const user = await this.administrationService.getUserData(
        process.env.API_KEY_PAYOUT,
        this.configService.get<string>('COMPTE_RESERVATION'),
      );
      const balanceAfterSending =
        parseInt(user.solde) + parseInt(amount) + parseInt(fees);
      const credit = await this.administrationService.updateUser(
        process.env.API_KEY_PAYOUT,
        user.id,
        {
          solde: balanceAfterSending.toString(),
        },
      );

      if (credit.affected === 1) {
        return {
          transfer,
          transaction,
          reservation,
          amount,
          receiverNumber,
          senderInfos,
          fees,
          status: QueryResponse.SUCCESS,
        };
      } else {
        await this.repository.update(transfer.id, {
          status: 'FAILED',
        });
        await this.administrationService.updateHistorique(
          process.env.API_KEY_PAYOUT,
          historique.id,
          {
            status: 'FAILED',
          },
        );
        await this.administrationService.updateTransaction(
          process.env.API_KEY_PAYOUT,
          transaction.id,
          {
            status: 'FAILED',
          },
        );
        return {
          transfer,
          reservation,
          amount,
          receiverNumber,
          senderInfos,
          fees,
          status: QueryResponse.INSUFFICIENT_FUNDS,
        };
      }
    }
  }

  async sendTransfer(
    reservation: any,
    receiverNumber: string,
    amount: string,
    transfer: Payout,
    transaction: any,
    fees: string,
    historique: any,
  ) {
    const getReceiverInfos = await this.administrationService.getUserData(
      process.env.API_KEY_PAYOUT,
      receiverNumber,
    );
    const getSenderInfos = await this.administrationService.getUserData(
      process.env.API_KEY_PAYOUT,
      transfer.senderPhoneNumber,
    );
    const updateReceiverBalance = await this.administrationService.updateUser(
      process.env.API_KEY_PAYOUT,
      getReceiverInfos.id,
      {
        solde: (parseInt(getReceiverInfos.solde) + parseInt(amount)).toString(),
      },
    );
    if (updateReceiverBalance.affected === 1) {
      //debit reservation account
      const user = await this.administrationService.getUserData(
        process.env.API_KEY_PAYOUT,
        this.configService.get<string>('COMPTE_RESERVATION'),
      );
      const balanceAfterSending =
        parseInt(user.solde) - parseInt(amount) - parseInt(fees);
      const debit = await this.administrationService.updateUser(
        process.env.API_KEY_PAYOUT,
        user.id,
        {
          solde: balanceAfterSending.toString(),
        },
      );
      if (debit.affected === 1) {
        const user = await this.administrationService.getUserData(
          process.env.API_KEY_PAYOUT,
          this.configService.get<string>('COMPTE_COLLECTE'),
        );
        const balanceAfterSending = parseInt(user.solde) + parseInt(fees);
        const credit = await this.administrationService.updateUser(
          process.env.API_KEY_PAYOUT,
          user.id,
          {
            solde: balanceAfterSending.toString(),
          },
        );
        if (credit) {
          await this.administrationService.createCompteCollecte(
            process.env.API_KEY_PAYOUT,
            {
              amount: fees,
              collectType: CollectType.FRAIS,
            },
          );
          //update reservation status
          await this.administrationService.updateCompteReservation(
            process.env.API_KEY_PAYOUT,
            reservation.id,
            {
              transactionStatus: 'COMPLETED',
            },
          );
          //update transfer status
          await this.repository.update(transfer.id, {
            status: TransactionsStatus.SUCCESS,
          });
          //update transaction status
          await this.administrationService.updateTransaction(
            process.env.API_KEY_PAYOUT,
            transaction.id,
            {
              status: 'SUCCESS',
            },
          );
          //update historique status
          await this.administrationService.updateHistorique(
            process.env.API_KEY_PAYOUT,
            historique.id,
            {
              status: TransactionsStatus.SUCCESS,
            },
          );
          //check if user is new
          const isNewUser =
            await this.administrationService.userReferralByUserId(
              process.env.API_KEY_PAYOUT,
              getSenderInfos.id,
            );
          if (isNewUser && isNewUser.isNew === true) {
            const host = await this.administrationService.getUserDataById(
              process.env.API_KEY_PAYOUT,
              isNewUser.hostId,
            );
            if (host) {
              const currentPoint = host.referralAmountToPoint;
              await this.administrationService.updateUser(
                process.env.API_KEY_PAYOUT,
                host.id,
                {
                  referralAmountToPoint: currentPoint + 500,
                },
              );
              await this.administrationService.updateReferral(
                process.env.API_KEY_PAYOUT,
                isNewUser.id,
                {
                  isNew: false,
                },
              );
            }
          }

          //notification au sender
          await this.administrationService.sendNotifications(
            process.env.API_KEY_PAYOUT,
            {
              token: getSenderInfos.expoPushToken,
              title: 'Transfert Djonanko',
              body: `Votre Transfert de ${amount} FCFA a été effectué avec succès.`,
            },
          );
          //notification au receiver
          await this.administrationService.sendNotifications(
            process.env.API_KEY_PAYOUT,
            {
              token: getReceiverInfos.expoPushToken,
              title: 'Transfert Djonanko',
              body: `${getReceiverInfos.fullname} vous a transferé ${amount} FCFA`,
            },
          );
        } else {
          return {
            status: QueryResponse.ERROR,
          };
        }

        return {
          status: QueryResponse.SUCCESS,
        };
      } else {
        await this.repository.update(transfer.id, {
          status: TransactionsStatus.FAILED,
        });
        await this.administrationService.updateTransaction(
          process.env.API_KEY_PAYOUT,
          transaction.id,
          {
            status: 'FAILED',
          },
        );
        return {
          status: QueryResponse.ERROR,
        };
      }
    } else {
      await this.repository.update(transfer.id, {
        status: TransactionsStatus.FAILED,
      });
      await this.administrationService.updateTransaction(
        process.env.API_KEY_PAYOUT,
        transaction.id,
        {
          status: 'FAILED',
        },
      );
      await this.administrationService.updateCompteReservation(
        process.env.API_KEY_PAYOUT,
        reservation.id,
        {
          transactionStatus: TransactionsStatus.FAILED,
        },
      );
      await this.administrationService.updateHistorique(
        process.env.API_KEY_PAYOUT,
        historique.id,
        {
          status: TransactionsStatus.FAILED,
        },
      );

      return {
        status: QueryResponse.ERROR,
      };
    }
  }

  async createHistorique(historique: any): Promise<CreateHistoriqueResultDto> {
    const history = await this.administrationService.createHistorique(
      process.env.API_KEY_PAYOUT,
      historique,
    );
    if (history) {
      return {
        historique: history,
        status: QueryResponse.SUCCESS,
      };
    } else {
      return {
        historique: history,
        status: QueryResponse.ERROR,
      };
    }
  }
}
