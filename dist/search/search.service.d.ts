import { RedisCacheService } from '../cache/cache.service.js';
import { SearchQueryDto } from './dto/search-query.dto.js';
import { AutocompleteQueryDto } from './dto/autocomplete-query.dto.js';
import { ISearchProvider, SearchResultResponse, AutocompleteResponse, FacetsResponse } from './providers/search-provider.interface.js';
export declare class SearchService {
    private readonly searchProvider;
    private readonly redisCacheService;
    private readonly logger;
    private readonly searchCacheTtl;
    private readonly autocompleteCacheTtl;
    constructor(searchProvider: ISearchProvider, redisCacheService: RedisCacheService);
    private generateCacheKey;
    search(dto: SearchQueryDto): Promise<SearchResultResponse>;
    autocomplete(dto: AutocompleteQueryDto): Promise<AutocompleteResponse>;
    getFacets(dto: SearchQueryDto): Promise<FacetsResponse>;
}
