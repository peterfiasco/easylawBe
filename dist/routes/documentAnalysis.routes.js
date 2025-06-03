"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const DocumentAnalysisController_1 = require("../controllers/DocumentAnalysis/DocumentAnalysisController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const fileUpload_middleware_1 = require("../middleware/fileUpload.middleware");
const router = express_1.default.Router();
// Analyze document (existing)
router.post('/analyze', authMiddleware_1.authMiddleware, fileUpload_middleware_1.uploadDocumentForAnalysis, fileUpload_middleware_1.handleMulterError, DocumentAnalysisController_1.DocumentAnalysisController.analyzeDocument);
// 🆕 Get user's analysis history
router.get('/history', authMiddleware_1.authMiddleware, DocumentAnalysisController_1.DocumentAnalysisController.getUserAnalysisHistory);
// 🆕 Get specific analysis by ID
router.get('/:analysisId', authMiddleware_1.authMiddleware, DocumentAnalysisController_1.DocumentAnalysisController.getAnalysisById);
// 🆕 Delete analysis
router.delete('/:analysisId', authMiddleware_1.authMiddleware, DocumentAnalysisController_1.DocumentAnalysisController.deleteAnalysis);
// 🆕 Improve document
router.post('/improve', authMiddleware_1.authMiddleware, fileUpload_middleware_1.uploadDocumentForAnalysis, fileUpload_middleware_1.handleMulterError, DocumentAnalysisController_1.DocumentAnalysisController.improveDocument);
exports.default = router;
