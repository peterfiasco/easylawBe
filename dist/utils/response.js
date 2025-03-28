"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = void 0;
const successResponse = (res, message, data = {}, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};
exports.successResponse = successResponse;
const errorResponse = (res, message, data = {}, statusCode = 500) => {
    return res.status(statusCode).json({
        success: false,
        message,
        data,
    });
};
exports.errorResponse = errorResponse;
