import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { SearchService } from './search.service.js';
import { SearchQueryDto } from './dto/search-query.dto.js';
import { AutocompleteQueryDto } from './dto/autocomplete-query.dto.js';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({
    summary: 'Search products with keyword, category, brand, color, size, price, discount & rating filters',
  })
  @ApiResponse({ status: 200, description: 'Paginated product search results with facets' })
  async search(@Query() queryDto: SearchQueryDto) {
    return this.searchService.search(queryDto);
  }

  @Get('autocomplete')
  @ApiOperation({ summary: 'Get fast autocomplete suggestions for search input' })
  @ApiResponse({ status: 200, description: 'Autocomplete search suggestions' })
  async autocomplete(@Query() queryDto: AutocompleteQueryDto) {
    return this.searchService.autocomplete(queryDto);
  }

  @Get('facets')
  @ApiOperation({ summary: 'Get dynamic sidebar facet option counts based on active query' })
  @ApiResponse({ status: 200, description: 'Faceted counts breakdown' })
  async getFacets(@Query() queryDto: SearchQueryDto) {
    return this.searchService.getFacets(queryDto);
  }
}
