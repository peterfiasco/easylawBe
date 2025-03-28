"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const RegisterController_1 = require("../../controllers/Auth/RegisterController");
const authRouter = (0, express_1.Router)();
authRouter.post('/login', RegisterController_1.Login);
exports.default = authRouter;
