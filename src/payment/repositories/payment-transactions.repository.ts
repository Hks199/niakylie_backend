import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  PaymentTransaction,
  PaymentTransactionDocument,
  TransactionStatus,
  RefundRecord,
} from '../schemas/payment-transaction.schema.js';

@Injectable()
export class PaymentTransactionsRepository {
  constructor(
    @InjectModel(PaymentTransaction.name)
    private readonly transactionModel: Model<PaymentTransactionDocument>,
  ) {}

  async create(data: Partial<PaymentTransaction>): Promise<PaymentTransactionDocument> {
    const txn = new this.transactionModel(data);
    return txn.save();
  }

  async findById(id: string): Promise<PaymentTransactionDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.transactionModel.findOne({ _id: new Types.ObjectId(id), isDeleted: false }).exec();
  }

  async findByTransactionId(transactionId: string): Promise<PaymentTransactionDocument | null> {
    return this.transactionModel.findOne({ transactionId, isDeleted: false }).exec();
  }

  async findByOrderId(orderId: string): Promise<PaymentTransactionDocument[]> {
    const filter: Record<string, any> = { isDeleted: false };
    if (Types.ObjectId.isValid(orderId)) {
      filter.orderId = new Types.ObjectId(orderId);
    } else {
      filter.orderNumber = orderId;
    }
    return this.transactionModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findByProviderOrderId(providerOrderId: string): Promise<PaymentTransactionDocument | null> {
    return this.transactionModel.findOne({ providerOrderId, isDeleted: false }).exec();
  }

  async updateStatus(
    id: string,
    status: TransactionStatus,
    extraData?: Partial<PaymentTransaction>,
  ): Promise<PaymentTransactionDocument | null> {
    return this.transactionModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { status, ...extraData },
        { new: true },
      )
      .exec();
  }

  async addRefundRecord(
    id: string,
    refundRecord: RefundRecord,
    refundedAmount: number,
    newStatus: TransactionStatus,
  ): Promise<PaymentTransactionDocument | null> {
    return this.transactionModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        {
          status: newStatus,
          $inc: { totalRefundedAmount: refundedAmount },
          $push: { refunds: refundRecord },
        },
        { new: true },
      )
      .exec();
  }
}
