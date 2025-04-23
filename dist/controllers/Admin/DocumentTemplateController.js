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
const path_1 = __importDefault(require("path"));
class DocumentTemplateController {
    constructor() {
        this.getAllTemplates = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Don't return the template file in the list view to reduce response size
                const templates = yield DocumentTemplate_1.default.find()
                    .select('-templateFile')
                    .sort({ createdAt: -1 })
                    .populate('category');
                res.status(200).json({ success: true, data: templates });
            }
            catch (error) {
                console.error('Error fetching templates:', error);
                next(error);
            }
        });
        this.getTemplateById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Don't return the template file by default to reduce response size
                const template = yield DocumentTemplate_1.default.findById(req.params.id)
                    .select('-templateFile')
                    .populate('category');
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
                // Debug: see the incoming request body and file
                console.log("[DEBUG] createTemplate -> incoming req.body:", req.body);
                console.log("[DEBUG] createTemplate -> incoming req.file:", req.file ? { fieldname: req.file.fieldname, originalname: req.file.originalname, size: req.file.size } : null);
                // Check if file was uploaded
                if (!req.file) {
                    res.status(400).json({
                        success: false,
                        message: 'Template file is required'
                    });
                    return;
                }
                // Parse fields from JSON string if needed
                let fields = [];
                if (typeof req.body.fields === 'string') {
                    try {
                        fields = JSON.parse(req.body.fields);
                    }
                    catch (e) {
                        console.error('Error parsing fields JSON:', e);
                        fields = [];
                    }
                }
                else if (Array.isArray(req.body.fields)) {
                    fields = req.body.fields;
                }
                // Process boolean isActive value
                const isActive = req.body.isActive === 'true' || req.body.isActive === true;
                // Create template with file information, now storing the buffer directly
                const newTemplate = new DocumentTemplate_1.default({
                    name: req.body.name,
                    description: req.body.description,
                    category: req.body.category,
                    fields: fields,
                    isActive: isActive,
                    templateFile: req.file.buffer, // Store the file buffer directly
                    templateFileName: req.file.originalname,
                    templateFileType: path_1.default.extname(req.file.originalname).substring(1)
                });
                yield newTemplate.save();
                // Debug: see the saved document (excluding the large file buffer)
                console.log("[DEBUG] createTemplate -> saved newTemplate:", Object.assign(Object.assign({}, newTemplate.toObject()), { templateFile: `<Buffer: ${req.file.size} bytes>` }));
                // Get the populated template to return (without the file buffer to reduce response size)
                const populatedTemplate = yield DocumentTemplate_1.default.findById(newTemplate._id)
                    .select('-templateFile')
                    .populate('category');
                res.status(201).json({ success: true, data: populatedTemplate });
            }
            catch (error) {
                console.error("[DEBUG] Error creating template:", error);
                // Narrow error to an Error type so TS doesn't complain about unknown.
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
            var _a;
            try {
                // Get existing template
                console.log("[DEBUG] updateTemplate -> req.file:", req.file ? { fieldname: req.file.fieldname, originalname: req.file.originalname, size: req.file.size } : null);
                const existingTemplate = yield DocumentTemplate_1.default.findById(req.params.id);
                if (!existingTemplate) {
                    res.status(404).json({ success: false, message: 'Template not found' });
                    return;
                }
                // Debug the incoming data
                console.log("[DEBUG] updateTemplate -> incoming req.body:", req.body);
                // Parse fields from JSON string if needed
                let fields = [];
                if (typeof req.body.fields === 'string') {
                    try {
                        fields = JSON.parse(req.body.fields);
                    }
                    catch (e) {
                        console.error('Error parsing fields JSON:', e);
                        fields = existingTemplate.fields; // Keep existing fields on error
                    }
                }
                else if (Array.isArray(req.body.fields)) {
                    fields = req.body.fields;
                }
                else {
                    fields = existingTemplate.fields; // Keep existing fields if none provided
                }
                // Prepare update data
                const updateData = {
                    fields: fields,
                    updatedAt: Date.now()
                };
                // Only update fields that are actually provided
                if (req.body.name)
                    updateData.name = req.body.name;
                if (req.body.description)
                    updateData.description = req.body.description;
                if (req.body.isActive !== undefined) {
                    updateData.isActive = req.body.isActive === 'true' || req.body.isActive === true;
                }
                // Handle category field specifically
                if (req.body.category) {
                    // If it's a valid ObjectId string
                    if (typeof req.body.category === 'string' && req.body.category.match(/^[0-9a-fA-F]{24}$/)) {
                        updateData.category = req.body.category;
                    }
                    // If category is an object with _id, use the _id
                    else if (typeof req.body.category === 'object' && req.body.category._id) {
                        updateData.category = req.body.category._id;
                    }
                }
                // If a new file was uploaded, update file information
                if (req.file) {
                    // No need to delete physical files since we're storing in MongoDB
                    updateData.templateFile = req.file.buffer;
                    updateData.templateFileName = req.file.originalname;
                    updateData.templateFileType = path_1.default.extname(req.file.originalname).substring(1);
                }
                console.log("[DEBUG] Final update data:", Object.assign(Object.assign({}, updateData), { templateFile: updateData.templateFile ? `<Buffer: ${(_a = req.file) === null || _a === void 0 ? void 0 : _a.size} bytes>` : undefined }));
                // Update the template
                const updatedTemplate = yield DocumentTemplate_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true })
                    .select('-templateFile')
                    .populate('category');
                res.status(200).json({ success: true, data: updatedTemplate });
            }
            catch (error) {
                console.error('Error updating template:', error);
                // Send a more detailed error response
                let errorMessage = "Error updating template";
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
                res.status(500).json({
                    success: false,
                    message: errorMessage,
                    error: error
                });
            }
        });
        this.deleteTemplate = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const template = yield DocumentTemplate_1.default.findById(req.params.id);
                if (!template) {
                    res.status(404).json({ success: false, message: 'Template not found' });
                    return;
                }
                // No need to delete physical files since we're storing in MongoDB
                // Now delete the document from database
                yield DocumentTemplate_1.default.deleteOne({ _id: template._id });
                res.status(200).json({ success: true, data: {} });
            }
            catch (error) {
                console.error('Error deleting template:', error);
                next(error);
            }
        });
        // Update download method to serve file from MongoDB
        this.downloadTemplateFile = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Get the template with the file buffer
                const template = yield DocumentTemplate_1.default.findById(req.params.id);
                if (!template || !template.templateFile) {
                    res.status(404).json({ success: false, message: 'Template file not found' });
                    return;
                }
                // Set content type based on file extension
                const contentType = template.templateFileType === 'pdf'
                    ? 'application/pdf'
                    : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                // Set appropriate headers
                res.setHeader('Content-Type', contentType);
                res.setHeader('Content-Disposition', `attachment; filename="${template.templateFileName}"`);
                // Send the file buffer directly from MongoDB
                res.send(template.templateFile);
            }
            catch (error) {
                console.error('Error downloading template file:', error);
                next(error);
            }
        });
    }
}
exports.DocumentTemplateController = DocumentTemplateController;
// DocumentCategoryController remains unchanged
class DocumentCategoryController {
    constructor() {
        // ... (existing code)
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
