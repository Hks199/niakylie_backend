import { Model } from 'mongoose';
import { Page, PageDocument } from '../schemas/page.schema.js';
export declare class PagesRepository {
    private readonly pageModel;
    constructor(pageModel: Model<PageDocument>);
    create(data: Partial<Page>): Promise<PageDocument>;
    findById(id: string): Promise<PageDocument | null>;
    findBySlug(slug: string): Promise<PageDocument | null>;
    findAllPublished(): Promise<PageDocument[]>;
    findAllAdmin(): Promise<PageDocument[]>;
    update(id: string, updateData: Partial<Page>): Promise<PageDocument | null>;
    softDelete(id: string): Promise<PageDocument | null>;
}
