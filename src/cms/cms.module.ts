import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Page, PageSchema } from './schemas/page.schema.js';
import { Faq, FaqSchema } from './schemas/faq.schema.js';
import { Blog, BlogSchema } from './schemas/blog.schema.js';
import { Subscriber, SubscriberSchema } from './schemas/subscriber.schema.js';

import { PagesRepository } from './repositories/pages.repository.js';
import { FaqsRepository } from './repositories/faqs.repository.js';
import { BlogsRepository } from './repositories/blogs.repository.js';
import { SubscribersRepository } from './repositories/subscribers.repository.js';

import { CmsService } from './cms.service.js';
import { CmsController } from './cms.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Page.name, schema: PageSchema },
      { name: Faq.name, schema: FaqSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Subscriber.name, schema: SubscriberSchema },
    ]),
  ],
  controllers: [CmsController],
  providers: [
    CmsService,
    PagesRepository,
    FaqsRepository,
    BlogsRepository,
    SubscribersRepository,
  ],
  exports: [CmsService, PagesRepository, FaqsRepository, BlogsRepository, SubscribersRepository],
})
export class CmsModule {}
