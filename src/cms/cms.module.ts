import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Page, PageSchema } from './schemas/page.schema.js';
import { Faq, FaqSchema } from './schemas/faq.schema.js';
import { Blog, BlogSchema } from './schemas/blog.schema.js';

import { PagesRepository } from './repositories/pages.repository.js';
import { FaqsRepository } from './repositories/faqs.repository.js';
import { BlogsRepository } from './repositories/blogs.repository.js';

import { CmsService } from './cms.service.js';
import { CmsController } from './cms.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Page.name, schema: PageSchema },
      { name: Faq.name, schema: FaqSchema },
      { name: Blog.name, schema: BlogSchema },
    ]),
  ],
  controllers: [CmsController],
  providers: [
    CmsService,
    PagesRepository,
    FaqsRepository,
    BlogsRepository,
  ],
  exports: [CmsService, PagesRepository, FaqsRepository, BlogsRepository],
})
export class CmsModule {}
