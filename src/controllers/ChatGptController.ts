import { RequestHandler } from 'express';
import OpenAI from 'openai';
import DocumentTemplate from '../models/DocumentTemplate';
import * as mammoth from 'mammoth';

/** 
 * Make sure openai@4.x is installed: 
 *   npm install openai@latest 
 * package.json should show e.g. "openai": "^4.89.0" 
 * 
 * Also install:
 *   npm install mammoth --save
 * For converting docx to text
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class ChatGptController {
  /**
   * Generate a legal document with dummy placeholders for privacy.
   * The 'placeholders' object in the request body might look like:
   * { EmployerName: "DummyEmployer", EmployeeName: "DummyEmployee", ... }
   */
  public static generateDocument: RequestHandler = async (req, res) => {
    try {
      console.log('[DEBUG] Generate Document Request:', {
        hasTemplateFile: !!req.file,
        templateType: req.body.templateType,
        hasPlaceholders: !!req.body.placeholders,
        title: req.body.title
      });
      
      const { templateType, title } = req.body;
      let placeholders = {};

      // Parse placeholders if it's a string
      try {
        if (typeof req.body.placeholders === 'string') {
          placeholders = JSON.parse(req.body.placeholders);
        } else if (typeof req.body.placeholders === 'object') {
          placeholders = req.body.placeholders;
        }
      } catch (parseError) {
        console.error('Error parsing placeholders:', parseError);
        placeholders = {};
      }

      // Validate input
      if (!templateType) {
        console.error('Missing templateType in request:', req.body);
        res.status(400).json({ 
          error: 'Template type is required. Please ensure the template has a valid category or name.'
        });
        return;
      }

      if (!placeholders || typeof placeholders !== 'object') {
        res.status(400).json({ error: 'A valid placeholders object is required.' });
        return;
      }

      // Check if template ID is provided to fetch from MongoDB
      let templateId = req.body.templateId;
      let templateContent = '';

      if (templateId) {
        try {
          // Fetch the template from MongoDB
          const template = await DocumentTemplate.findById(templateId);
          
          if (template && template.templateFile) {
            // If we have a template file stored in MongoDB
            if (template.templateFileType === 'docx') {
              // Convert DOCX to text
              try {
                const result = await mammoth.extractRawText({ buffer: template.templateFile });
                templateContent = result.value;
                console.log('[DEBUG] Successfully extracted text from DOCX template');
              } catch (convErr) {
                console.error('Error converting DOCX to text:', convErr);
              }
            } else if (template.templateFileType === 'pdf') {
              // For PDF, we might need additional libraries
              // For now, note that we have a PDF but can't extract text directly
              console.log('[DEBUG] PDF file detected but text extraction not implemented');
            }
          }
        } catch (fetchErr) {
          console.error('Error fetching template from MongoDB:', fetchErr);
        }
      }

      // Check if we have a file uploaded with the request
      if (req.file && !templateContent) {
        try {
          if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            // For DOCX files
            const result = await mammoth.extractRawText({ buffer: req.file.buffer });
            templateContent = result.value;
            console.log('[DEBUG] Successfully extracted text from uploaded DOCX file');
          } else {
            console.log('[DEBUG] Uploaded file type not supported for text extraction:', req.file.mimetype);
          }
        } catch (fileErr) {
          console.error('Error processing uploaded file:', fileErr);
        }
      }

      // Base prompt
      let userPrompt = `
        You are an AI legal assistant specializing in Nigerian Law.
        Generate a full, legally sound ${templateType} document referencing relevant legislation
        and containing placeholders for the user data.
        Here are the placeholders:
        ${Object.keys(placeholders)
          .map((key) => `• {${key}}`)
          .join('\n')}
        Do not add disclaimers that contravene local regulations.
        Return the full text, retaining each placeholder in curly braces EXACTLY as typed.
      `;

      // If we have template content, enhance the prompt
      if (templateContent) {
        userPrompt = `
          You are an AI legal assistant specializing in Nigerian Law.
          I am providing you with a ${templateType} document template.
          
          TEMPLATE CONTENT:
          ${templateContent}
          
          Based on this template, generate a complete and legally sound document that maintains the
          same structure and legal clauses, but uses these placeholders:
          ${Object.keys(placeholders)
            .map((key) => `• {{${key}}}`)
            .join('\n')}
          
          Make sure to keep each placeholder exactly as provided (with double curly braces).
          Return the full text document that follows Nigerian law and includes all necessary
          legal provisions for this type of document.
        `;
      }

      // Call OpenAI (v4)
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful Nigerian legal document drafting assistant. Provide the answer in plain text.',
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.2,
      });

      const aiMessage = response.choices?.[0]?.message?.content || '';

      // Send the AI-generated text
      res.json({
        success: true,
        data: {
          generatedText: aiMessage,
        },
      });
    } catch (error: any) {
      console.error('Error in ChatGptController.generateDocument:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate document. See server logs for details.',
      });
    }
  };

  /**
   * Improve a document using AI
   */
  public static improveDocument: RequestHandler = async (req, res) => {
    try {
      const { documentContent, templateType, extraPrompt } = req.body;
      
      // Validate input
      if (!documentContent) {
        res.status(400).json({ error: 'Document content is required.' });
        return;
      }

      // Check if we have a template file
      let templateFileContent = '';
      if (req.file) {
        try {
          if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            // For DOCX files
            const result = await mammoth.extractRawText({ buffer: req.file.buffer });
            templateFileContent = result.value;
          } else if (req.file.mimetype === 'application/pdf') {
            // For PDF, note that we'd need additional libraries
            console.log('PDF file detected but text extraction not implemented');
          }
        } catch (fileErr) {
          console.error('Error extracting text from template file:', fileErr);
        }
      }

      // Construct the prompt
      let userPrompt = `
        You are an AI legal assistant specializing in Nigerian Law.
        Please improve the following ${templateType || 'legal'} document:

        DOCUMENT TO IMPROVE:
        ${documentContent}
        
        ${extraPrompt || 'Make it more professional, comprehensive, and legally sound.'}
        
        Ensure it references relevant Nigerian legislation where appropriate.
        Maintain all existing sections but enhance them with better language and more complete legal clauses.
        Return the improved document as plain text.
      `;

      // If we also have template file content, include it for reference
      if (templateFileContent) {
        userPrompt += `
          
          For reference, here is a template document of the same type that you can use for inspiration:
          
          REFERENCE TEMPLATE:
          ${templateFileContent}
          
          Do not copy this template directly, but you can use its structure and legal clauses as guidance.
        `;
      }

      // Call OpenAI (v4)
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful Nigerian legal document drafting assistant specializing in document improvement. Provide the complete improved document in plain text.',
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        max_tokens: 2500,
        temperature: 0.3,
      });

      const improvedText = response.choices?.[0]?.message?.content || '';

      // Send the improved text
      res.json({
        success: true,
        data: {
          improvedText,
        },
      });
    } catch (error: any) {
      console.error('Error in ChatGptController.improveDocument:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to improve document. See server logs for details.',
      });
    }
  };

  /** 
   * Check if a query is related to Nigerian legal topics 
   */
  public static checkLegalQuery: RequestHandler = async (req, res) => {
    try {
      const { query } = req.body;
      
      // Basic validation
      if (!query) {
        res.status(400).json({
          success: false,
          error: 'Query is required.'
        });
        return;
      }
      
      console.log("API Key available:", !!process.env.OPENAI_API_KEY);
      
      try {
        // Use OpenAI to determine if query is related to Nigerian law
        const isLegalQuery = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that determines if a query is related to Nigerian legal topics. Reply with either "true" or "false" only.',
            },
            {
              role: 'user',
              content: `Is this question related to Nigerian law or legal matters? Question: "${query}"`,
            },
          ],
          max_tokens: 10,
          temperature: 0.1,
        });
        
        const isLegalQueryResult = isLegalQuery.choices?.[0]?.message?.content?.toLowerCase().includes('true');
        
        // Send the result
        res.json({
          success: true,
          isLegalQuery: isLegalQueryResult
        });
      } catch (openAiError) {
        console.error('OpenAI API Error:', openAiError);
        res.status(500).json({
          success: false,
          error: 'OpenAI API error: ' + openAiError.message
        });
      }
    } catch (error) {
      console.error('General Error in checkLegalQuery:', error);
      res.status(500).json({
        success: false,
        error: 'Server error: ' + (error.message || 'Unknown error')
      });
    }
  };

  /**
   * Handle chat messages with legal queries
   */
  public static handleChatQuery: RequestHandler = async (req, res) => {
    try {
      const { query, chatHistory = [] } = req.body;
      // Basic validation
      if (!query) {
        res.status(400).json({
          success: false,
          error: 'Query is required.'
        });
        return;
      }
      // Determine if query is related to Nigerian law
      const isLegalQuery = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that determines if a query is related to Nigerian legal topics. Reply with either "true" or "false" only.',
          },
          {
            role: 'user',
            content: `Is this question related to Nigerian law or legal matters? Question: "${query}"`,
          },
        ],
        max_tokens: 10,
        temperature: 0.1,
      });
      const isLegalQueryResult = isLegalQuery.choices?.[0]?.message?.content?.toLowerCase().includes('true');
      // If not a legal query, return an appropriate message
      if (!isLegalQueryResult) {
        res.json({
          success: true,
          data: {
            response: "I'm sorry, I can only answer questions related to Nigerian law and legal matters. Please ask a legal question or seek advice on a legal issue in Nigeria.",
            isLegalQuery: false
          }
        });
        return;
      }
      // Format the chat history for OpenAI
      const formattedHistory = [
        {
          role: 'system',
          content: `You are a helpful, friendly Nigerian legal assistant.
          - Format your responses in a well-structured way with paragraphs and bullet points where appropriate
          - Be conversational but professional
          - Cite relevant Nigerian laws and statutes when applicable
          - Always provide context-specific answers based on Nigerian legal framework
          - Keep your responses concise and within screen view when possible
          - If unsure, acknowledge limitations and suggest consulting a qualified Nigerian lawyer`
        },
        ...chatHistory
      ];
      // Add the current query
      formattedHistory.push({
        role: 'user',
        content: query
      });
      // Get response from OpenAI
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: formattedHistory,
        max_tokens: 800,
        temperature: 0.7,
      });
      const aiMessage = response.choices?.[0]?.message?.content || '';
      // Send the AI-generated response
      res.json({
        success: true,
        data: {
          response: aiMessage,
          isLegalQuery: true
        }
      });
    } catch (error: any) {
      console.error('Error in ChatGptController.handleChatQuery:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process chat query. See server logs for details.'
      });
    }
  };
}
