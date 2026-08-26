"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const product_schema_js_1 = require("../products/schemas/product.schema.js");
const index_js_1 = require("../cache/index.js");
const search_service_js_1 = require("./search.service.js");
const search_controller_js_1 = require("./search.controller.js");
const search_provider_interface_js_1 = require("./providers/search-provider.interface.js");
const mongo_search_provider_js_1 = require("./providers/mongo-search.provider.js");
const elastic_search_provider_js_1 = require("./providers/elastic-search.provider.js");
let SearchModule = class SearchModule {
};
exports.SearchModule = SearchModule;
exports.SearchModule = SearchModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: product_schema_js_1.Product.name, schema: product_schema_js_1.ProductSchema }]),
            index_js_1.RedisCacheModule,
        ],
        controllers: [search_controller_js_1.SearchController],
        providers: [
            search_service_js_1.SearchService,
            mongo_search_provider_js_1.MongoSearchProvider,
            elastic_search_provider_js_1.ElasticSearchProvider,
            {
                provide: search_provider_interface_js_1.SEARCH_PROVIDER_TOKEN,
                useFactory: (configService, mongoProvider, elasticProvider) => {
                    const providerType = configService.get('SEARCH_PROVIDER') ?? 'mongo';
                    if (providerType.toLowerCase() === 'elasticsearch') {
                        return elasticProvider;
                    }
                    return mongoProvider;
                },
                inject: [config_1.ConfigService, mongo_search_provider_js_1.MongoSearchProvider, elastic_search_provider_js_1.ElasticSearchProvider],
            },
        ],
        exports: [search_service_js_1.SearchService, search_provider_interface_js_1.SEARCH_PROVIDER_TOKEN],
    })
], SearchModule);
//# sourceMappingURL=search.module.js.map