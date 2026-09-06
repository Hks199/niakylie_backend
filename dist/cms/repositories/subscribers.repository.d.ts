import { Model } from 'mongoose';
import { Subscriber, SubscriberDocument } from '../schemas/subscriber.schema.js';
export declare class SubscribersRepository {
    private readonly subscriberModel;
    constructor(subscriberModel: Model<SubscriberDocument>);
    createOrUpdate(data: {
        email?: string;
        phone?: string;
        source?: string;
    }): Promise<SubscriberDocument>;
    findAll(query: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<{
        subscribers: (import("mongoose").Document<unknown, {}, SubscriberDocument, {}, import("mongoose").DefaultSchemaOptions> & Subscriber & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    deleteById(id: string): Promise<SubscriberDocument | null>;
}
