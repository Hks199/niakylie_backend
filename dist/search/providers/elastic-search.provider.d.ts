import { SearchQueryDto } from '../dto/search-query.dto.js';
import { ISearchProvider, SearchResultResponse, AutocompleteResponse, FacetsResponse } from './search-provider.interface.js';
export declare class ElasticSearchProvider implements ISearchProvider {
    search(dto: SearchQueryDto): Promise<SearchResultResponse>;
    autocomplete(query: string, limit?: number): Promise<AutocompleteResponse>;
    getFacets(dto: SearchQueryDto): Promise<FacetsResponse>;
}
