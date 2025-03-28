"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentCategoryController = exports.DocumentTemplateController = void 0;
const DocumentTemplate_1 = __importDefault(require("../../models/DocumentTemplate"));
const DocumentCategory_1 = __importDefault(require("../../models/DocumentCategory"));
class DocumentTemplateController {
    constructor() {
        this.getAllTemplates = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const templates = yield DocumentTemplate_1.default.find()
                    .sort({ createdAt: -1 })
                    .populate('category'); // <-- Add populate if 'category' is a ref
                res.status(200).json({ success: true, data: templates });
            }
            catch (error) {
                console.error('Error fetching templates:', error);
                next(error);
            }
        });
        this.getTemplateById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const template = yield DocumentTemplate_1.default.findById(req.params.id);
                if (!template) {
                    res.status(404).json({ success: false, message: 'Template not found' });
                    return;
                }
                res.status(200).json({ success: true, data: template });
            }
            catch (error) {
                console.error('Error fetching template:', error);
                next(error);
            }
        });
        this.createTemplate = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Debug: see the incoming request body
                console.log("[DEBUG] createTemplate -> incoming req.body:", req.body);
                const newTemplate = new DocumentTemplate_1.default(req.body);
                yield newTemplate.save();
                // Debug: see the saved document
                console.log("[DEBUG] createTemplate -> saved newTemplate:", newTemplate);
                res.status(201).json({ success: true, data: newTemplate });
            }
            catch (error) {
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
        });
        this.updateTemplate = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedTemplate = yield DocumentTemplate_1.default.findByIdAndUpdate(req.params.id, Object.assign(Object.assign({}, req.body), { updatedAt: Date.now() }), { new: true });
                if (!updatedTemplate) {
                    res.status(404).json({ success: false, message: 'Template not found' });
                    return;
                }
                res.status(200).json({ success: true, data: updatedTemplate });
            }
            catch (error) {
                console.error('Error updating template:', error);
                next(error);
            }
        });
        this.deleteTemplate = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const deletedTemplate = yield DocumentTemplate_1.default.findByIdAndDelete(req.params.id);
                if (!deletedTemplate) {
                    res.status(404).json({ success: false, message: 'Template not found' });
                    return;
                }
                res.status(200).json({ success: true, data: {} });
            }
            catch (error) {
                console.error('Error deleting template:', error);
                next(error);
            }
        });
    }
}
exports.DocumentTemplateController = DocumentTemplateController;
class DocumentCategoryController {
    constructor() {
        this.getAllCategories = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const categories = yield DocumentCategory_1.default.find().sort({ name: 1 });
                res.status(200).json({ success: true, data: categories });
            }
            catch (error) {
                console.error('Error fetching categories:', error);
                next(error);
            }
        });
        this.createCategory = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const newCategory = new DocumentCategory_1.default(req.body);
                yield newCategory.save();
                res.status(201).json({ success: true, data: newCategory });
            }
            catch (error) {
                console.error('Error creating category:', error);
                next(error);
            }
        });
        this.updateCategory = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedCategory = yield DocumentCategory_1.default.findByIdAndUpdate(req.params.id, Object.assign(Object.assign({}, req.body), { updatedAt: Date.now() }), { new: true });
                if (!updatedCategory) {
                    res.status(404).json({ success: false, message: 'Category not found' });
                    return;
                }
                res.status(200).json({ success: true, data: updatedCategory });
            }
            catch (error) {
                console.error('Error updating category:', error);
                next(error);
            }
        });
        this.deleteCategory = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if category is used by any templates
                const templatesUsingCategory = yield DocumentTemplate_1.default.findOne({ category: req.params.id });
                if (templatesUsingCategory) {
                    res.status(400).json({
                        success: false,
                        message: 'Cannot delete category that is used by templates'
                    });
                    return;
                }
                const deletedCategory = yield DocumentCategory_1.default.findByIdAndDelete(req.params.id);
                if (!deletedCategory) {
                    res.status(404).json({ success: false, message: 'Category not found' });
                    return;
                }
                res.status(200).json({ success: true, data: {} });
            }
            catch (error) {
                console.error('Error deleting category:', error);
                next(error);
            }
        });
    }
}
exports.DocumentCategoryController = DocumentCategoryController;
