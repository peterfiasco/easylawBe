"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const SettingController_1 = require("../../controllers/Dashboard/SettingController");
const Dashboardrouter = express_1.default.Router();
Dashboardrouter.put('/update', authMiddleware_1.UserMiddleware, SettingController_1.UpdateSettings);
Dashboardrouter.get('/user', authMiddleware_1.UserMiddleware, SettingController_1.FetchUserDetails);
exports.default = Dashboardrouter;
