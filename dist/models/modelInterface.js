"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMessage = createMessage;
function createMessage(role, content, timestamp = new Date()) {
    return {
        role,
        content,
        timestamp
    };
}
