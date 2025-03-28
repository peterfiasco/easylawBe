import express from 'express';
import { adminMiddleware } from '../../middleware/authMiddleware';
import {
  DocumentTemplateController,
  DocumentCategoryController
} from '../../controllers/Admin/DocumentTemplateController';

const router = express.Router();

// Initialize controllers
const templateController = new DocumentTemplateController();
const categoryController = new DocumentCategoryController();

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

export default router;
