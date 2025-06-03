import { OpenAI } from "openai";
import { IMessage } from "../../models/modelInterface";
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const GenerateLegalAdvise = async (query: string, chatHistory: IMessage[]): Promise<any> => {
  try {
    console.log("[AI SERVICE] Processing query:", { 
      query: query.substring(0, 50) + "...", 
      historyLength: chatHistory.length 
    });

    // Format chat history to match OpenAI's message structure
    const formattedHistory = chatHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Include the latest user query
    formattedHistory.push({ role: "user", content: query });

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI legal assistant for Nigeria. Provide general legal guidance for Nigeria only. Always recommend consulting with a qualified Nigerian lawyer for specific legal advice.",
        },
        ...formattedHistory,
      ],
      max_completion_tokens: 1200,
      temperature: 0.6
    });

    const aiResponse = response.choices[0].message?.content || "Sorry, I couldn't process your request.";
    
    console.log("[AI SERVICE] Response generated successfully:", {
      responseLength: aiResponse.length,
      tokensUsed: response.usage?.total_tokens || 0
    });

    return aiResponse;
    
  } catch (error) {
    console.error("[AI SERVICE] Error:", error);
    throw error;
  }
};

export const generateChatTitle = async (query: string): Promise<any> => {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `Generate a short, concise title for the following conversation: "${query}". Keep it brief.`,
      },
    ],
    max_completion_tokens: 10,
  });

  const aiResponse =
    response.choices[0].message?.content ||
    "Sorry, I couldn't process your request.";

  return aiResponse;
};
