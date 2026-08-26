import { Model } from 'mongoose';
import { Faq, FaqDocument } from '../schemas/faq.schema.js';
export declare class FaqsRepository {
    private readonly faqModel;
    constructor(faqModel: Model<FaqDocument>);
    create(data: Partial<Faq>): Promise<FaqDocument>;
    findById(id: string): Promise<FaqDocument | null>;
    findAllActiveGrouped(): Promise<Record<string, FaqDocument[]>>;
    findAllAdmin(): Promise<FaqDocument[]>;
    update(id: string, updateData: Partial<Faq>): Promise<FaqDocument | null>;
    softDelete(id: string): Promise<FaqDocument | null>;
}
