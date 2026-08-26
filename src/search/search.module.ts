import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

import { Product, ProductSchema } from '../products/schemas/product.schema.js';
import { RedisCacheModule } from '../cache/index.js';
import { SearchService } from './search.service.js';
import { SearchController } from './search.controller.js';
import { SEARCH_PROVIDER_TOKEN } from './providers/search-provider.interface.js';
import { MongoSearchProvider } from './providers/mongo-search.provider.js';
import { ElasticSearchProvider } from './providers/elastic-search.provider.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    RedisCacheModule,
  ],
  controllers: [SearchController],
  providers: [
    SearchService,
    MongoSearchProvider,
    ElasticSearchProvider,
    {
      provide: SEARCH_PROVIDER_TOKEN,
      useFactory: (
        configService: ConfigService,
        mongoProvider: MongoSearchProvider,
        elasticProvider: ElasticSearchProvider,
      ) => {
        const providerType = configService.get<string>('SEARCH_PROVIDER') ?? 'mongo';
        if (providerType.toLowerCase() === 'elasticsearch') {
          return elasticProvider;
        }
        return mongoProvider;
      },
      inject: [ConfigService, MongoSearchProvider, ElasticSearchProvider],
    },
  ],
  exports: [SearchService, SEARCH_PROVIDER_TOKEN],
})
export class SearchModule {}
