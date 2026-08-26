"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const cache_service_js_1 = require("../cache/cache.service.js");
const search_provider_interface_js_1 = require("./providers/search-provider.interface.js");
let SearchService = SearchService_1 = class SearchService {
    searchProvider;
    redisCacheService;
    logger = new common_1.Logger(SearchService_1.name);
    searchCacheTtl = 300;
    autocompleteCacheTtl = 600;
    constructor(searchProvider, redisCacheService) {
        this.searchProvider = searchProvider;
        this.redisCacheService = redisCacheService;
    }
    generateCacheKey(prefix, payload) {
        const serialized = JSON.stringify(payload, Object.keys(payload).sort());
        const hash = (0, crypto_1.createHash)('md5').update(serialized).digest('hex');
        return `search:${prefix}:${hash}`;
    }
    async search(dto) {
        if (dto.nocache) {
            this.logger.log('Bypassing cache for search query');
            return this.searchProvider.search(dto);
        }
        const cacheKey = this.generateCacheKey('query', dto);
        const cachedResult = await this.redisCacheService.get(cacheKey);
        if (cachedResult) {
            this.logger.log(`Cache HIT for key "${cacheKey}"`);
            return cachedResult;
        }
        this.logger.log(`Cache MISS for key "${cacheKey}". Executing search provider.`);
        const result = await this.searchProvider.search(dto);
        await this.redisCacheService.set(cacheKey, result, this.searchCacheTtl);
        return result;
    }
    async autocomplete(dto) {
        const { q, limit = 5 } = dto;
        const cacheKey = `search:autocomplete:${q.toLowerCase().trim()}:${limit}`;
        const cachedResult = await this.redisCacheService.get(cacheKey);
        if (cachedResult) {
            this.logger.log(`Cache HIT for autocomplete key "${cacheKey}"`);
            return cachedResult;
        }
        const result = await this.searchProvider.autocomplete(q, limit);
        await this.redisCacheService.set(cacheKey, result, this.autocompleteCacheTtl);
        return result;
    }
    async getFacets(dto) {
        const cacheKey = this.generateCacheKey('facets', dto);
        const cachedResult = await this.redisCacheService.get(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }
        const result = await this.searchProvider.getFacets(dto);
        await this.redisCacheService.set(cacheKey, result, this.searchCacheTtl);
        return result;
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = SearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(search_provider_interface_js_1.SEARCH_PROVIDER_TOKEN)),
    __metadata("design:paramtypes", [search_provider_interface_js_1.ISearchProvider,
        cache_service_js_1.RedisCacheService])
], SearchService);
//# sourceMappingURL=search.service.js.map