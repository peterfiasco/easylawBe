import { OpenAI } from "openai";
import { IMessage } from "../../models/modelInterface";
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const GenerateLegalAdvise = async (query: string, chatHistory: IMessage[]): Promise<any> => {

   // Format chat history to match OpenAI's message structure
   const formattedHistory = chatHistory.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  // Include the latest user query
  formattedHistory.push({ role: "user", content: query });

  const response = await openai.chat.completions.create({
    model: "o3-mini-2025-01-31",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful AI legal assistant for Nigeria. Provide general legal guidance for Nigeria only.",
      },
      // { role: "user", content: query },
      ...formattedHistory,
    ],
  });

  const aiResponse =
    response.choices[0].message?.content ||
    "Sorry, I couldn't process your request.";

  return aiResponse;
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
    max_tokens: 10,
  });

  const aiResponse =
    response.choices[0].message?.content ||
    "Sorry, I couldn't process your request.";

  return aiResponse;
};
