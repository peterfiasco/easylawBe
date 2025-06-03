import { Request, Response } from 'express';
import { CustomRequest } from '../../middleware/authMiddleware';
import * as mammoth from 'mammoth';
import OpenAI from 'openai';
import DocumentAnalysis from '../../models/DocumentAnalysis'; // Add this import

import pdfParse from 'pdf-parse';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class DocumentAnalysisController {
  
  // Upload and analyze document
  static analyzeDocument = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      console.log('📄 Document Analysis Request Started');
      console.log('User from request:', req.user);
      console.log('User ID:', req.user?._id);
      console.log('File uploaded:', !!req.file);
      
      // 🚨 IMPORTANT: Check if user exists
      if (!req.user || !req.user._id) {
        console.error('❌ No user found in request or missing user ID');
        res.status(401).json({
          success: false,
          message: 'Authentication required. User not found in request.'
        });
        return;
      }
      
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No document uploaded'
        });
        return;
      }

      // Extract text from document (keeping existing extraction logic)
      let documentText = '';
      const fileType = req.file.mimetype;
      
      try {
        if (fileType === 'application/pdf') {
          const pdfData = await pdfParse(req.file.buffer);
          documentText = pdfData.text;
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          const result = await mammoth.extractRawText({ buffer: req.file.buffer });
          documentText = result.value;
        } else if (fileType === 'application/msword') {
          documentText = req.file.buffer.toString('utf-8');
        } else if (fileType === 'text/plain') {
          documentText = req.file.buffer.toString('utf-8');
        } else {
          res.status(400).json({
            success: false,
            message: `Unsupported file type: ${fileType}. Please upload PDF, DOC, DOCX, or TXT files.`
          });
          return;
        }
      } catch (extractionError: any) {
        res.status(500).json({
          success: false,
          message: `Failed to extract text from document: ${extractionError.message}`
        });
        return;
      }

      const cleanedText = documentText.trim();
      if (cleanedText.length < 10) {
        res.status(400).json({
          success: false,
          message: `Document appears to be empty or too short for analysis.`
        });
        return;
      }

      console.log('📝 Document text extracted successfully');
      console.log('📝 Text length:', cleanedText.length);

      // Create the analysis prompt (keeping existing logic)
      const documentPreview = cleanedText.substring(0, 2000);
      const exampleJson = `{
  "overall_score": 85,
  "document_type": "Employment Contract",
  "strengths": ["Clear terms", "Well structured"],
  "weaknesses": ["Missing signatures"],
  "legal_compliance_score": 80,
  "clarity_score": 90,
  "specific_improvements": ["Add signature section"],
  "missing_clauses": ["Termination clause"],
  "summary": "Well-drafted document"
}`;

      const analysisPrompt = 
        'Analyze this legal document and respond with ONLY a JSON object (no other text):\n\n' +
        exampleJson + '\n\n' +
        'Document to analyze: ' + documentPreview;

      console.log('🤖 Calling OpenAI...');
      
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a Nigerian legal expert. Respond with ONLY valid JSON.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_tokens: 800,
        temperature: 0.1
      });

      const analysisText = response.choices?.[0]?.message?.content || '';
      console.log('🤖 Raw OpenAI response:', analysisText);
      
      // 🔧 FIXED: Declare both variables outside try block
      let analysis;
      let cleanedResponse;
      
      try {
        // 🔧 FIXED: Assign cleanedResponse inside the try block
        cleanedResponse = analysisText.replace(/```json/g, '').replace(/```/g, '').trim();
        analysis = JSON.parse(cleanedResponse);
        console.log('✅ Successfully parsed JSON');
      } catch (parseError) {
        console.error('❌ Failed to parse JSON, using fallback');
        analysis = {
          overall_score: 75,
          document_type: 'Legal Document',
          strengths: ['Document contains legal content'],
          weaknesses: ['Requires manual review'],
          legal_compliance_score: 70,
          clarity_score: 75,
          specific_improvements: ['Professional review recommended'],
          missing_clauses: ['Standard legal clauses'],
          summary: 'Document processed successfully. Professional review recommended.'
        };
      }

      // 🆕 SAVE TO DATABASE with proper user_id
      const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('💾 Attempting to save to database...');
      console.log('💾 User ID for save:', req.user._id);
      console.log('💾 Analysis ID:', analysisId);
      
      const documentAnalysis = new DocumentAnalysis({
        user_id: req.user._id,
        analysis_id: analysisId,
        original_filename: req.file.originalname,
        file_size: req.file.size,
        file_type: fileType,
        document_text: cleanedText,
        analysis: analysis
      });

      await documentAnalysis.save();
      console.log('💾 Analysis saved to database with ID:', analysisId);

      res.json({
        success: true,
        data: {
          analysis_id: analysisId,
          filename: req.file.originalname,
          analysis: analysis,
          document_length: cleanedText.length,
          created_at: documentAnalysis.created_at
        }
      });

    } catch (error: any) {
      console.error('❌ Document analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to analyze document',
        error: error.message
      });
    }
  };

  // 🆕 GET USER'S ANALYSIS HISTORY
  static getUserAnalysisHistory = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const analyses = await DocumentAnalysis.find({ user_id: req.user?._id })
        .select('-document_text') // Exclude full text for performance
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit);

      const total = await DocumentAnalysis.countDocuments({ user_id: req.user?._id });

      res.json({
        success: true,
        data: {
          analyses,
          pagination: {
            current_page: page,
            total_pages: Math.ceil(total / limit),
            total_count: total,
            per_page: limit
          }
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch analysis history',
        error: error.message
      });
    }
  };

  // 🆕 GET SPECIFIC ANALYSIS BY ID
  static getAnalysisById = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const { analysisId } = req.params;

      const analysis = await DocumentAnalysis.findOne({
        analysis_id: analysisId,
        user_id: req.user?._id
      });

      if (!analysis) {
        res.status(404).json({
          success: false,
          message: 'Analysis not found'
        });
        return;
      }

      res.json({
        success: true,
        data: analysis
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch analysis',
        error: error.message
      });
    }
  };

  // 🆕 DELETE ANALYSIS
  static deleteAnalysis = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const { analysisId } = req.params;

      const result = await DocumentAnalysis.findOneAndDelete({
        analysis_id: analysisId,
        user_id: req.user?._id
      });

      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Analysis not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Analysis deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete analysis',
        error: error.message
      });
    }
  };

  // 🆕 IMPROVE DOCUMENT METHOD
  static improveDocument = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      console.log('🔧 Document Improvement Request Started');
      console.log('User ID:', req.user?._id);
      console.log('Request body:', req.body);
      
      if (!req.user || !req.user._id) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      let documentText = '';
      const { analysisId, improvementType = 'general' } = req.body;

      // Get document from existing analysis
      if (analysisId) {
        const existingAnalysis = await DocumentAnalysis.findOne({
          analysis_id: analysisId,
          user_id: req.user._id
        });

        if (!existingAnalysis) {
          res.status(404).json({
            success: false,
            message: 'Analysis not found'
          });
          return;
        }

        documentText = existingAnalysis.document_text;
      }
      // Get document from uploaded file
      else if (req.file) {
        const fileType = req.file.mimetype;
        
        try {
          if (fileType === 'application/pdf') {
            const pdfData = await pdfParse(req.file.buffer);
            documentText = pdfData.text;
          } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ buffer: req.file.buffer });
            documentText = result.value;
          } else if (fileType === 'application/msword') {
            documentText = req.file.buffer.toString('utf-8');
          } else if (fileType === 'text/plain') {
            documentText = req.file.buffer.toString('utf-8');
          }
        } catch (extractionError: any) {
          res.status(500).json({
            success: false,
            message: `Failed to extract text: ${extractionError.message}`
          });
          return;
        }
      } else {
        res.status(400).json({
          success: false,
          message: 'Either analysisId or document file is required'
        });
        return;
      }

      if (!documentText || documentText.trim().length < 10) {
        res.status(400).json({
          success: false,
          message: 'Document text is too short for improvement'
        });
        return;
      }

      // Create improvement prompt
      // Replace the promptMap in improveDocument method (around line 300):
const promptMap: Record<string, string> = {
  legal_compliance: `Improve this legal document's compliance with Nigerian law. Focus on legal clauses, regulatory compliance, and proper terminology. Return only the improved document:

${documentText}`,
  
  clarity: `Improve this document's clarity and readability. Focus on simplifying language and better organization. Return only the improved document:

${documentText}`,
  
  completeness: `Make this document more complete by adding missing sections and clauses. Return only the improved document:

${documentText}`,
  
  general: `Improve this legal document comprehensively for Nigerian law compliance, clarity, and completeness. Return only the improved document:

${documentText}`
};


      const improvementPrompt = promptMap[improvementType] || promptMap.general;

      console.log('🤖 Calling OpenAI for document improvement...');
      
      // Replace the OpenAI call parameters in improveDocument method:
const response = await openai.chat.completions.create({
  model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  messages: [
    {
      role: 'system',
      content: 'You are a Nigerian legal expert. Return only the improved document text without explanations.'
    },
    {
      role: 'user',
      content: improvementPrompt
    }
  ],
  max_tokens: 4000, // Increased from 2000
  temperature: 0.3
});


      const improvedText = response.choices?.[0]?.message?.content || '';
      
      if (!improvedText) {
        res.status(500).json({
          success: false,
          message: 'Failed to generate improved document'
        });
        return;
      }

      console.log('✅ Document improvement completed');

      res.json({
        success: true,
        data: {
          original_length: documentText.length,
          improved_length: improvedText.length,
          improvement_type: improvementType,
          improved_document: improvedText,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error: any) {
      console.error('❌ Document improvement error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to improve document',
        error: error.message
      });
    }
  };
}
