import { SearchQueryDto } from '../dto/search-query.dto.js';

export interface FacetCount {
  label: string;
  value: string;
  count: number;
}

export interface FacetsResponse {
  brands: FacetCount[];
  categories: FacetCount[];
  colors: FacetCount[];
  sizes: FacetCount[];
  priceRanges: Array<{ min: number; max: number; count: number }>;
}

export interface SearchResultResponse {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets?: FacetsResponse;
}

export interface AutocompleteResponse {
  query: string;
  suggestions: Array<{ text: string; type: 'product' | 'category' | 'brand' | 'tag'; id?: string }>;
}

export abstract class ISearchProvider {
  abstract search(dto: SearchQueryDto): Promise<SearchResultResponse>;
  abstract autocomplete(query: string, limit?: number): Promise<AutocompleteResponse>;
  abstract getFacets(dto: SearchQueryDto): Promise<FacetsResponse>;
}

export const SEARCH_PROVIDER_TOKEN = 'ISearchProvider';
