import { Injectable, NotImplementedException } from '@nestjs/common';
import { SearchQueryDto } from '../dto/search-query.dto.js';
import {
  ISearchProvider,
  SearchResultResponse,
  AutocompleteResponse,
  FacetsResponse,
} from './search-provider.interface.js';

@Injectable()
export class ElasticSearchProvider implements ISearchProvider {
  async search(dto: SearchQueryDto): Promise<SearchResultResponse> {
    throw new NotImplementedException(
      'Elasticsearch provider is ready for cluster configuration. Set SEARCH_PROVIDER=mongo to use Mongoose pipeline.',
    );
  }

  async autocomplete(query: string, limit: number = 5): Promise<AutocompleteResponse> {
    throw new NotImplementedException(
      'Elasticsearch autocomplete strategy ready for cluster endpoints.',
    );
  }

  async getFacets(dto: SearchQueryDto): Promise<FacetsResponse> {
    throw new NotImplementedException(
      'Elasticsearch facet aggregation strategy ready for cluster endpoints.',
    );
  }
}
