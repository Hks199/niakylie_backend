"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElasticSearchProvider = void 0;
const common_1 = require("@nestjs/common");
let ElasticSearchProvider = class ElasticSearchProvider {
    async search(dto) {
        throw new common_1.NotImplementedException('Elasticsearch provider is ready for cluster configuration. Set SEARCH_PROVIDER=mongo to use Mongoose pipeline.');
    }
    async autocomplete(query, limit = 5) {
        throw new common_1.NotImplementedException('Elasticsearch autocomplete strategy ready for cluster endpoints.');
    }
    async getFacets(dto) {
        throw new common_1.NotImplementedException('Elasticsearch facet aggregation strategy ready for cluster endpoints.');
    }
};
exports.ElasticSearchProvider = ElasticSearchProvider;
exports.ElasticSearchProvider = ElasticSearchProvider = __decorate([
    (0, common_1.Injectable)()
], ElasticSearchProvider);
//# sourceMappingURL=elastic-search.provider.js.map