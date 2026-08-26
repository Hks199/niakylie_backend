import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service.js';
import { RedisCacheService } from '../cache/cache.service.js';
import { SEARCH_PROVIDER_TOKEN } from './providers/search-provider.interface.js';

describe('SearchService', () => {
  let service: SearchService;
  let provider: any;
  let cacheService: jest.Mocked<RedisCacheService>;

  beforeEach(async () => {
    const mockSearchProvider = {
      search: jest.fn(),
      autocomplete: jest.fn(),
      getFacets: jest.fn(),
    };

    const mockRedisCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      reset: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: SEARCH_PROVIDER_TOKEN, useValue: mockSearchProvider },
        { provide: RedisCacheService, useValue: mockRedisCacheService },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    provider = module.get(SEARCH_PROVIDER_TOKEN);
    cacheService = module.get(RedisCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    it('should return cached result if cache HIT', async () => {
      const mockResult = { data: [{ name: 'Saree' }], total: 1, page: 1, limit: 12, totalPages: 1 };
      cacheService.get.mockResolvedValue(mockResult);

      const dto = { q: 'saree' };
      const result = await service.search(dto);

      expect(cacheService.get).toHaveBeenCalled();
      expect(provider.search).not.toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it('should execute provider and set cache if cache MISS', async () => {
      const mockResult = { data: [{ name: 'Kurti' }], total: 1, page: 1, limit: 12, totalPages: 1 };
      cacheService.get.mockResolvedValue(null as any);
      provider.search.mockResolvedValue(mockResult);

      const dto = { q: 'kurti' };
      const result = await service.search(dto);

      expect(provider.search).toHaveBeenCalledWith(dto);
      expect(cacheService.set).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it('should bypass cache if nocache=true is provided', async () => {
      const mockResult = { data: [], total: 0, page: 1, limit: 12, totalPages: 1 };
      provider.search.mockResolvedValue(mockResult);

      const dto = { q: 'kurti', nocache: true };
      const result = await service.search(dto);

      expect(cacheService.get).not.toHaveBeenCalled();
      expect(provider.search).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('autocomplete', () => {
    it('should return autocomplete suggestions from provider if cache MISS', async () => {
      const mockAutocomplete = { query: 'kur', suggestions: [{ text: 'Kurti', type: 'product' }] };
      cacheService.get.mockResolvedValue(null as any);
      provider.autocomplete.mockResolvedValue(mockAutocomplete);

      const result = await service.autocomplete({ q: 'kur', limit: 5 });

      expect(provider.autocomplete).toHaveBeenCalledWith('kur', 5);
      expect(cacheService.set).toHaveBeenCalled();
      expect(result).toEqual(mockAutocomplete);
    });
  });
});
