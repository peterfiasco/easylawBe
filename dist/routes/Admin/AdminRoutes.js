"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const DocumentTemplateController_1 = require("../../controllers/Admin/DocumentTemplateController");
const router = express_1.default.Router();
// Initialize controllers
const templateController = new DocumentTemplateController_1.DocumentTemplateController();
const categoryController = new DocumentTemplateController_1.DocumentCategoryController();
// Template routes
router.get('/templates', templateController.getAllTemplates);
router.get('/templates/:id', templateController.getTemplateById);
router.post('/templates', templateController.createTemplate);
router.put('/templates/:id', templateController.updateTemplate);
router.delete('/templates/:id', templateController.deleteTemplate);
// Category routes
router.get('/categories', categoryController.getAllCategories);
router.post('/categories', categoryController.createCategory);
router.put('/categories/:id', categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);
exports.default = router;
