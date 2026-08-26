"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaginatedResult = createPaginatedResult;
function createPaginatedResult(items, totalItems, page, limit) {
    const totalPages = Math.ceil(totalItems / limit);
    return {
        items,
        meta: {
            page,
            limit,
            totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    };
}
//# sourceMappingURL=paginated-response.interface.js.map