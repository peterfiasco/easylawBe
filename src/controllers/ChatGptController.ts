import { RequestHandler } from 'express';
import OpenAI from 'openai';

/**
 * Make sure openai@4.x is installed:
 *   npm install openai@latest
 * package.json should show e.g. "openai": "^4.89.0"
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
      const { templateType, placeholders } = req.body;

      // Validate input
      if (!templateType) {
        res.status(400).json({ error: 'Template type is required.' });
        return; // stop execution here
      }
      if (!placeholders || typeof placeholders !== 'object') {
        res.status(400).json({ error: 'A valid placeholders object is required.' });
        return; // stop execution here
      }

      // Construct the prompt
      const userPrompt = `
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

      // Call OpenAI (v4)
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
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
        max_tokens: 1200,
        temperature: 0.2,
      });

      const aiMessage = response.choices?.[0]?.message?.content || '';

      // Send the AI-generated text (no 'return' before res.json)
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
  } catch (error: any) {
    console.error('Error in ChatGptController.checkLegalQuery:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check if query is legal related.'
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

