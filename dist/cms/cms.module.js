"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CmsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const page_schema_js_1 = require("./schemas/page.schema.js");
const faq_schema_js_1 = require("./schemas/faq.schema.js");
const blog_schema_js_1 = require("./schemas/blog.schema.js");
const subscriber_schema_js_1 = require("./schemas/subscriber.schema.js");
const pages_repository_js_1 = require("./repositories/pages.repository.js");
const faqs_repository_js_1 = require("./repositories/faqs.repository.js");
const blogs_repository_js_1 = require("./repositories/blogs.repository.js");
const subscribers_repository_js_1 = require("./repositories/subscribers.repository.js");
const cms_service_js_1 = require("./cms.service.js");
const cms_controller_js_1 = require("./cms.controller.js");
let CmsModule = class CmsModule {
};
exports.CmsModule = CmsModule;
exports.CmsModule = CmsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: page_schema_js_1.Page.name, schema: page_schema_js_1.PageSchema },
                { name: faq_schema_js_1.Faq.name, schema: faq_schema_js_1.FaqSchema },
                { name: blog_schema_js_1.Blog.name, schema: blog_schema_js_1.BlogSchema },
                { name: subscriber_schema_js_1.Subscriber.name, schema: subscriber_schema_js_1.SubscriberSchema },
            ]),
        ],
        controllers: [cms_controller_js_1.CmsController],
        providers: [
            cms_service_js_1.CmsService,
            pages_repository_js_1.PagesRepository,
            faqs_repository_js_1.FaqsRepository,
            blogs_repository_js_1.BlogsRepository,
            subscribers_repository_js_1.SubscribersRepository,
        ],
        exports: [cms_service_js_1.CmsService, pages_repository_js_1.PagesRepository, faqs_repository_js_1.FaqsRepository, blogs_repository_js_1.BlogsRepository, subscribers_repository_js_1.SubscribersRepository],
    })
], CmsModule);
//# sourceMappingURL=cms.module.js.map