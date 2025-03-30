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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGptController = void 0;
const openai_1 = __importDefault(require("openai"));
/**
 * Make sure openai@4.x is installed:
 *   npm install openai@latest
 * package.json should show e.g. "openai": "^4.89.0"
 */
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
class ChatGptController {
}
exports.ChatGptController = ChatGptController;
_a = ChatGptController;
/**
 * Generate a legal document with dummy placeholders for privacy.
 * The 'placeholders' object in the request body might look like:
 * { EmployerName: "DummyEmployer", EmployeeName: "DummyEmployee", ... }
 */
ChatGptController.generateDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d;
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
        const response = yield openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful Nigerian legal document drafting assistant. Provide the answer in plain text.',
                },
                {
                    role: 'user',
                    content: userPrompt,
                },
            ],
            max_tokens: 1200,
            temperature: 0.2,
        });
        const aiMessage = ((_d = (_c = (_b = response.choices) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.content) || '';
        // Send the AI-generated text (no 'return' before res.json)
        res.json({
            success: true,
            data: {
                generatedText: aiMessage,
            },
        });
    }
    catch (error) {
        console.error('Error in ChatGptController.generateDocument:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate document. See server logs for details.',
        });
    }
});
/**
* Check if a query is related to Nigerian legal topics
*/
ChatGptController.checkLegalQuery = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e;
    try {
        const { query } = req.body;
        // Basic validation
        if (!query) {
            res.status(400).json({
                success: false,
                error: 'Query is required.'
            });
            return; // Just return without a value
        }
        console.log("API Key available:", !!process.env.OPENAI_API_KEY);
        try {
            // Use OpenAI to determine if query is related to Nigerian law
            const isLegalQuery = yield openai.chat.completions.create({
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
            const isLegalQueryResult = (_e = (_d = (_c = (_b = isLegalQuery.choices) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.content) === null || _e === void 0 ? void 0 : _e.toLowerCase().includes('true');
            // Send the result
            res.json({
                success: true,
                isLegalQuery: isLegalQueryResult
            });
            // Don't return the result of res.json()
        }
        catch (openAiError) {
            console.error('OpenAI API Error:', openAiError);
            res.status(500).json({
                success: false,
                error: 'OpenAI API error: ' + openAiError.message
            });
            // Don't return the result of res.status().json()
        }
    }
    catch (error) {
        console.error('General Error in checkLegalQuery:', error);
        res.status(500).json({
            success: false,
            error: 'Server error: ' + (error.message || 'Unknown error')
        });
        // Don't return the result of res.status().json()
    }
});
/**
 * Handle chat messages with legal queries
 */
ChatGptController.handleChatQuery = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e, _f, _g, _h;
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
        const isLegalQuery = yield openai.chat.completions.create({
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
        const isLegalQueryResult = (_e = (_d = (_c = (_b = isLegalQuery.choices) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.content) === null || _e === void 0 ? void 0 : _e.toLowerCase().includes('true');
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
        const response = yield openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: formattedHistory,
            max_tokens: 800,
            temperature: 0.7,
        });
        const aiMessage = ((_h = (_g = (_f = response.choices) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.message) === null || _h === void 0 ? void 0 : _h.content) || '';
        // Send the AI-generated response
        res.json({
            success: true,
            data: {
                response: aiMessage,
                isLegalQuery: true
            }
        });
    }
    catch (error) {
        console.error('Error in ChatGptController.handleChatQuery:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process chat query. See server logs for details.'
        });
    }
});
