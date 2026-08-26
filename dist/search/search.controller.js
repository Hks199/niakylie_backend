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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const search_service_js_1 = require("./search.service.js");
const search_query_dto_js_1 = require("./dto/search-query.dto.js");
const autocomplete_query_dto_js_1 = require("./dto/autocomplete-query.dto.js");
let SearchController = class SearchController {
    searchService;
    constructor(searchService) {
        this.searchService = searchService;
    }
    async search(queryDto) {
        return this.searchService.search(queryDto);
    }
    async autocomplete(queryDto) {
        return this.searchService.autocomplete(queryDto);
    }
    async getFacets(queryDto) {
        return this.searchService.getFacets(queryDto);
    }
};
exports.SearchController = SearchController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Search products with keyword, category, brand, color, size, price, discount & rating filters',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated product search results with facets' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_query_dto_js_1.SearchQueryDto]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('autocomplete'),
    (0, swagger_1.ApiOperation)({ summary: 'Get fast autocomplete suggestions for search input' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Autocomplete search suggestions' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [autocomplete_query_dto_js_1.AutocompleteQueryDto]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "autocomplete", null);
__decorate([
    (0, common_1.Get)('facets'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dynamic sidebar facet option counts based on active query' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Faceted counts breakdown' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_query_dto_js_1.SearchQueryDto]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "getFacets", null);
exports.SearchController = SearchController = __decorate([
    (0, swagger_1.ApiTags)('Search'),
    (0, common_1.Controller)('search'),
    __metadata("design:paramtypes", [search_service_js_1.SearchService])
], SearchController);
//# sourceMappingURL=search.controller.js.map