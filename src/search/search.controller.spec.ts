import { Test, TestingModule } from '@nestjs/testing';

import { SearchController } from './search.controller.js';
import { SearchService } from './search.service.js';

describe('SearchController', () => {
  let controller: SearchController;
  let service: jest.Mocked<SearchService>;

  beforeEach(async () => {
    const mockSearchService = {
      search: jest.fn(),
      autocomplete: jest.fn(),
      getFacets: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [{ provide: SearchService, useValue: mockSearchService }],
    }).compile();

    controller = module.get<SearchController>(SearchController);
    service = module.get(SearchService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('search', () => {
    it('should delegate to searchService.search', async () => {
      const mockResult = { data: [], total: 0, page: 1, limit: 12, totalPages: 0 };
      service.search.mockResolvedValue(mockResult);

      const dto = { q: 'dress', minPrice: 500 };
      const result = await controller.search(dto);

      expect(service.search).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockResult);
    });
  });

  describe('autocomplete', () => {
    it('should delegate to searchService.autocomplete', async () => {
      const mockResult = { query: 'dre', suggestions: [] };
      service.autocomplete.mockResolvedValue(mockResult as any);

      const dto = { q: 'dre', limit: 5 };
      const result = await controller.autocomplete(dto);

      expect(service.autocomplete).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockResult);
    });
  });

  describe('getFacets', () => {
    it('should delegate to searchService.getFacets', async () => {
      const mockFacets = { brands: [], categories: [], colors: [], sizes: [], priceRanges: [] };
      service.getFacets.mockResolvedValue(mockFacets as any);

      const dto = { q: 'dress' };
      const result = await controller.getFacets(dto);

      expect(service.getFacets).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockFacets);
    });
  });
});
