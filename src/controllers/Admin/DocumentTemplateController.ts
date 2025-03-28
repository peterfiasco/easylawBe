import { Request, Response, NextFunction } from 'express';
import DocumentTemplate from '../../models/DocumentTemplate';
import DocumentCategory from '../../models/DocumentCategory';

// Custom type that ensures your handlers return Promise<void>
type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export class DocumentTemplateController {
  public getAllTemplates: AsyncRequestHandler = async (req, res, next) => {
    try {
      const templates = await DocumentTemplate.find()
        .sort({ createdAt: -1 })
        .populate('category'); // <-- Add populate if 'category' is a ref
  
      res.status(200).json({ success: true, data: templates });
    } catch (error) {
      console.error('Error fetching templates:', error);
      next(error);
    }
  };
  

  public getTemplateById: AsyncRequestHandler = async (req, res, next) => {
    try {
      const template = await DocumentTemplate.findById(req.params.id);
      if (!template) {
        res.status(404).json({ success: false, message: 'Template not found' });
        return;
      }
      res.status(200).json({ success: true, data: template });
    } catch (error) {
      console.error('Error fetching template:', error);
      next(error);
    }
  };

  public createTemplate: AsyncRequestHandler = async (req, res, next) => {
    try {
      // Debug: see the incoming request body
      console.log("[DEBUG] createTemplate -> incoming req.body:", req.body);
  
      const newTemplate = new DocumentTemplate(req.body);
      await newTemplate.save();
  
      // Debug: see the saved document
      console.log("[DEBUG] createTemplate -> saved newTemplate:", newTemplate);
  
      res.status(201).json({ success: true, data: newTemplate });
    } catch (error) {
      console.error("[DEBUG] Error creating template:", error);
  
      // Narrow error to an Error type so TS doesn’t complain about unknown.
      let errorMessage = "Error creating template";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
  
      res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }
  };
  
  

  public updateTemplate: AsyncRequestHandler = async (req, res, next) => {
    try {
      const updatedTemplate = await DocumentTemplate.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: Date.now() },
        { new: true }
      );
      if (!updatedTemplate) {
        res.status(404).json({ success: false, message: 'Template not found' });
        return;
      }
      res.status(200).json({ success: true, data: updatedTemplate });
    } catch (error) {
      console.error('Error updating template:', error);
      next(error);
    }
  };

  public deleteTemplate: AsyncRequestHandler = async (req, res, next) => {
    try {
      const deletedTemplate = await DocumentTemplate.findByIdAndDelete(req.params.id);
      if (!deletedTemplate) {
        res.status(404).json({ success: false, message: 'Template not found' });
        return;
      }
      res.status(200).json({ success: true, data: {} });
    } catch (error) {
      console.error('Error deleting template:', error);
      next(error);
    }
  };
}

export class DocumentCategoryController {
  public getAllCategories: AsyncRequestHandler = async (req, res, next) => {
    try {
      const categories = await DocumentCategory.find().sort({ name: 1 });
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      console.error('Error fetching categories:', error);
      next(error);
    }
  };

  public createCategory: AsyncRequestHandler = async (req, res, next) => {
    try {
      const newCategory = new DocumentCategory(req.body);
      await newCategory.save();
      res.status(201).json({ success: true, data: newCategory });
    } catch (error) {
      console.error('Error creating category:', error);
      next(error);
    }
  };

  public updateCategory: AsyncRequestHandler = async (req, res, next) => {
    try {
      const updatedCategory = await DocumentCategory.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: Date.now() },
        { new: true }
      );
      if (!updatedCategory) {
        res.status(404).json({ success: false, message: 'Category not found' });
        return;
      }
      res.status(200).json({ success: true, data: updatedCategory });
    } catch (error) {
      console.error('Error updating category:', error);
      next(error);
    }
  };

  public deleteCategory: AsyncRequestHandler = async (req, res, next) => {
    try {
      // Check if category is used by any templates
      const templatesUsingCategory = await DocumentTemplate.findOne({ category: req.params.id });
      if (templatesUsingCategory) {
        res.status(400).json({
          success: false,
          message: 'Cannot delete category that is used by templates'
        });
        return;
      }

      const deletedCategory = await DocumentCategory.findByIdAndDelete(req.params.id);
      if (!deletedCategory) {
        res.status(404).json({ success: false, message: 'Category not found' });
        return;
      }

      res.status(200).json({ success: true, data: {} });
    } catch (error) {
      console.error('Error deleting category:', error);
      next(error);
    }
  };
}
