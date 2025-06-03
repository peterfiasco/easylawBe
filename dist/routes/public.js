"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Create this new file for public routes
const express_1 = __importDefault(require("express"));
const AdminBusinessServicePricingController_1 = require("../controllers/Admin/AdminBusinessServicePricingController");
const router = express_1.default.Router();
// Public pricing endpoint (no auth required)
router.get('/business-services/pricing', AdminBusinessServicePricingController_1.AdminBusinessServicePricingController.getPublicPricing);
exports.default = router;
