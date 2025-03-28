import { Response } from "express";
import { CustomRequest } from "../../middleware/authMiddleware";
import { errorResponse, successResponse } from "../../utils/response";
import { AiInterface } from "../../types/Dashboard";
import Joi from "joi";
import { generateChatTitle, GenerateLegalAdvise } from "./AISearchService";
import Chat from "../../models/Chat";

const AISchema = Joi.object({
  query: Joi.string().required(),
});

export const AIRequestControl = async (
  req: CustomRequest,
  res: Response
): Promise<any> => {
  try {
    const { query }: AiInterface = req.body;
    const { user_id } = req.user!;
    const { chat_id } = req.params;

    const { error } = AISchema.validate(req.body);
    if (error)
      return errorResponse(
        res,
        `Validation error: ${error.details[0].message}`,
        { error: error.details[0].message },
        400
      );

    if (!user_id) {
      return errorResponse(res, "user details is required", {}, 400);
    }

    let chat;
    if (chat_id) {
      chat = await Chat.findById(chat_id);
      if (!chat) {
        return errorResponse(res, "Chat not found", {}, 404);
      }
      chat.messages.push({
        role: "user",
        content: query,
        timestamp: new Date(),
      } as any);
    } else {
      const title = await generateChatTitle(query);
      chat = new Chat({
        user_id: user_id,
        title,
        messages: [
          { role: "user", content: query, timestamp: new Date() } as any,
        ],
      });

      await chat.save();
    }

    const trimmedMessages = chat.messages.slice(-30);
    const response = await GenerateLegalAdvise(query, trimmedMessages);

    // Add AI response using Mongoose Schema
    chat.messages.push({
      role: "assistant",
      content: response,
      timestamp: new Date(),
    } as any);

    await chat.save();

    return successResponse(res, "AI response generated", {chat_id: chat._id, title: chat.title, response }, 200);
  } catch (error: any) {
    return errorResponse(
      res,
      "Internal Server Error",
      { error: error.message },
      500
    );
  }
};
export const AIGetAllHistory = async (
  req: CustomRequest,
  res: Response
): Promise<any> => {
  try {
    const { user_id } = req.user!;

    if (!user_id) {
      return errorResponse(res, "user details is required", {}, 400);
    }
   const  chat = await Chat.find({ user_id })

    return successResponse(res, "Chat History", {chat }, 200);
  } catch (error: any) {
    return errorResponse(
      res,
      "Internal Server Error",
      { error: error.message },
      500
    );
  }
};

export const AIGetChatHistory = async (
  req: CustomRequest,
  res: Response
): Promise<any> => {
  try {
    const { user_id } = req.user!;
    const { chat_id } = req.params;

    if (!user_id) {
      return errorResponse(res, "user details is required", {}, 400);
    }
   const  chat = await Chat.find({ user_id, _id: chat_id })

    return successResponse(res, "Chat History", {chat }, 200);
  } catch (error: any) {
    return errorResponse(
      res,
      "Internal Server Error",
      { error: error.message },
      500
    );
  }
};
