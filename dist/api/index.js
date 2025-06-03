"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const app = require("../index").default;
function handler(req, res) {
    return app(req, res);
}
