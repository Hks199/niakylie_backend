"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REQUEST_TIMEOUT_MS = exports.BCRYPT_SALT_ROUNDS = exports.PASSWORD_MAX_LENGTH = exports.PASSWORD_MIN_LENGTH = exports.ALLOWED_VIDEO_MIMES = exports.ALLOWED_IMAGE_MIMES = exports.MAX_FILES_COUNT = exports.MAX_FILE_SIZE = exports.DEFAULT_SORT_ORDER = exports.DEFAULT_SORT_FIELD = exports.MAX_LIMIT = exports.DEFAULT_LIMIT = exports.DEFAULT_PAGE = void 0;
exports.DEFAULT_PAGE = 1;
exports.DEFAULT_LIMIT = 10;
exports.MAX_LIMIT = 100;
exports.DEFAULT_SORT_FIELD = 'createdAt';
exports.DEFAULT_SORT_ORDER = 'desc';
exports.MAX_FILE_SIZE = 5 * 1024 * 1024;
exports.MAX_FILES_COUNT = 10;
exports.ALLOWED_IMAGE_MIMES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
];
exports.ALLOWED_VIDEO_MIMES = ['video/mp4', 'video/webm'];
exports.PASSWORD_MIN_LENGTH = 8;
exports.PASSWORD_MAX_LENGTH = 128;
exports.BCRYPT_SALT_ROUNDS = 12;
exports.REQUEST_TIMEOUT_MS = 30000;
//# sourceMappingURL=app.constants.js.map