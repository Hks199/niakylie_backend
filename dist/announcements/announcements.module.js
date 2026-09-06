"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const announcement_schema_js_1 = require("./schemas/announcement.schema.js");
const announcements_repository_js_1 = require("./repositories/announcements.repository.js");
const announcements_service_js_1 = require("./announcements.service.js");
const announcements_controller_js_1 = require("./announcements.controller.js");
const notifications_module_js_1 = require("../notifications/notifications.module.js");
let AnnouncementsModule = class AnnouncementsModule {
};
exports.AnnouncementsModule = AnnouncementsModule;
exports.AnnouncementsModule = AnnouncementsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: announcement_schema_js_1.Announcement.name, schema: announcement_schema_js_1.AnnouncementSchema }]),
            notifications_module_js_1.NotificationsModule,
        ],
        controllers: [announcements_controller_js_1.AnnouncementsController],
        providers: [announcements_service_js_1.AnnouncementsService, announcements_repository_js_1.AnnouncementsRepository],
        exports: [announcements_service_js_1.AnnouncementsService, announcements_repository_js_1.AnnouncementsRepository],
    })
], AnnouncementsModule);
//# sourceMappingURL=announcements.module.js.map