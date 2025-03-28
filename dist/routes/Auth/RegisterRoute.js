"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const RegisterController_1 = require("../../controllers/Auth/RegisterController");
const router = express_1.default.Router();
router.post('/create-account', RegisterController_1.Register);
// router.post('/login', Login);
module.exports = router;
