import { Model } from 'mongoose';
import { ProductDocument } from '../../products/schemas/product.schema.js';
import { SearchQueryDto } from '../dto/search-query.dto.js';
import { ISearchProvider, SearchResultResponse, AutocompleteResponse, FacetsResponse } from './search-provider.interface.js';
export declare class MongoSearchProvider implements ISearchProvider {
    private readonly productModel;
    constructor(productModel: Model<ProductDocument>);
    search(dto: SearchQueryDto): Promise<SearchResultResponse>;
    autocomplete(query: string, limit?: number): Promise<AutocompleteResponse>;
    getFacets(dto: SearchQueryDto): Promise<FacetsResponse>;
}
