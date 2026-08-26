import { SearchService } from './search.service.js';
import { SearchQueryDto } from './dto/search-query.dto.js';
import { AutocompleteQueryDto } from './dto/autocomplete-query.dto.js';
export declare class SearchController {
    private readonly searchService;
    constructor(searchService: SearchService);
    search(queryDto: SearchQueryDto): Promise<import("./providers/search-provider.interface.js").SearchResultResponse>;
    autocomplete(queryDto: AutocompleteQueryDto): Promise<import("./providers/search-provider.interface.js").AutocompleteResponse>;
    getFacets(queryDto: SearchQueryDto): Promise<import("./providers/search-provider.interface.js").FacetsResponse>;
}
