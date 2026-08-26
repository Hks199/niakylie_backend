import { Injectable, Inject, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { RedisCacheService } from '../cache/cache.service.js';
import { SearchQueryDto } from './dto/search-query.dto.js';
import { AutocompleteQueryDto } from './dto/autocomplete-query.dto.js';
import {
  ISearchProvider,
  SEARCH_PROVIDER_TOKEN,
  SearchResultResponse,
  AutocompleteResponse,
  FacetsResponse,
} from './providers/search-provider.interface.js';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly searchCacheTtl = 300; // 5 minutes in seconds
  private readonly autocompleteCacheTtl = 600; // 10 minutes in seconds

  constructor(
    @Inject(SEARCH_PROVIDER_TOKEN) private readonly searchProvider: ISearchProvider,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  private generateCacheKey(prefix: string, payload: Record<string, any>): string {
    const serialized = JSON.stringify(payload, Object.keys(payload).sort());
    const hash = createHash('md5').update(serialized).digest('hex');
    return `search:${prefix}:${hash}`;
  }

  async search(dto: SearchQueryDto): Promise<SearchResultResponse> {
    if (dto.nocache) {
      this.logger.log('Bypassing cache for search query');
      return this.searchProvider.search(dto);
    }

    const cacheKey = this.generateCacheKey('query', dto);
    const cachedResult = await this.redisCacheService.get<SearchResultResponse>(cacheKey);

    if (cachedResult) {
      this.logger.log(`Cache HIT for key "${cacheKey}"`);
      return cachedResult;
    }

    this.logger.log(`Cache MISS for key "${cacheKey}". Executing search provider.`);
    const result = await this.searchProvider.search(dto);

    await this.redisCacheService.set(cacheKey, result, this.searchCacheTtl);
    return result;
  }

  async autocomplete(dto: AutocompleteQueryDto): Promise<AutocompleteResponse> {
    const { q, limit = 5 } = dto;
    const cacheKey = `search:autocomplete:${q.toLowerCase().trim()}:${limit}`;

    const cachedResult = await this.redisCacheService.get<AutocompleteResponse>(cacheKey);
    if (cachedResult) {
      this.logger.log(`Cache HIT for autocomplete key "${cacheKey}"`);
      return cachedResult;
    }

    const result = await this.searchProvider.autocomplete(q, limit);
    await this.redisCacheService.set(cacheKey, result, this.autocompleteCacheTtl);
    return result;
  }

  async getFacets(dto: SearchQueryDto): Promise<FacetsResponse> {
    const cacheKey = this.generateCacheKey('facets', dto);
    const cachedResult = await this.redisCacheService.get<FacetsResponse>(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    const result = await this.searchProvider.getFacets(dto);
    await this.redisCacheService.set(cacheKey, result, this.searchCacheTtl);
    return result;
  }
}
