"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationEventsService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
let NotificationEventsService = class NotificationEventsService {
    notificationSubject = new rxjs_1.Subject();
    emitNotification(event) {
        this.notificationSubject.next(event);
    }
    getNotificationStream(userId, isAdmin = false) {
        return this.notificationSubject.asObservable().pipe((0, operators_1.filter)((event) => {
            const isAdminEvent = Boolean(event.metadata?.isAdminEvent);
            const isReviewEvent = event.metadata?.targetTab === 'reviews' ||
                Boolean(event.metadata?.reviewId) ||
                /product review/i.test(event.title || '');
            if (isAdminEvent || isReviewEvent) {
                return isAdmin;
            }
            return !event.userId || event.userId.toString() === userId.toString();
        }), (0, operators_1.map)((event) => ({
            data: event,
            type: 'notification',
            id: event._id?.toString() || event.id || String(Date.now()),
        })));
    }
};
exports.NotificationEventsService = NotificationEventsService;
exports.NotificationEventsService = NotificationEventsService = __decorate([
    (0, common_1.Injectable)()
], NotificationEventsService);
//# sourceMappingURL=notification-events.service.js.map