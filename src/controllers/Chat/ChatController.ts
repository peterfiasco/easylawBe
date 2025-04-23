import { Server } from "socket.io";
import type { Socket as ClientSocket } from "socket.io/dist/socket";
import { GenerateLegalAdvise } from "../AI/AISearchService";
import Chat from "../../models/Chat";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Import the CustomJwtPayload interface or define it here
interface CustomJwtPayload {
  _id?: string | mongoose.Types.ObjectId;
  user_id?: string | mongoose.Types.ObjectId;
  role?: string;
  email?: string;
  iat?: number;
  exp?: number;
  [key: string]: any;
}

export class ChatController {
  private io: Server;
  
  constructor(io: Server) {
    this.io = io;
  }

  public initializeConnection = async (socket: ClientSocket) => {
    console.log("Initialize the socket");
    
    // Get user from token
    let userId: string | null = null;
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (token) {
      try {
        // Type cast to our custom payload type
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as CustomJwtPayload;
        // Use either user_id or _id, whichever is available
        userId = (decoded.user_id || decoded._id)?.toString() || null;
        
        if (userId) {
          console.log(`Authenticated socket connection for user ${userId}`);
        } else {
          console.warn("Token verified but no user ID found in payload");
        }
      } catch (error) {
        console.error("Token verification failed:", error);
      }
    }

    // Listen for the 'searchquery' event
    socket.on("searchquery", async ({ query, model, chatId, chatHistory = [] }) => {
      try {
        console.log("searchquery event triggered. query:", query, "model:", model);
        
        const response = await GenerateLegalAdvise(query, chatHistory);
        
        // If we have a user ID and chat ID, save this interaction to the database
        if (userId && chatId) {
          try {
            // Find the chat
            const chat = await Chat.findById(chatId);
            
            // Only update if the chat belongs to this user
            if (chat && chat.user_id.toString() === userId) {
              // Create a properly typed message object that matches your schema
              // Here we're assuming your IMessage schema has these fields
              chat.messages.push({
                role: 'assistant',
                content: response,
                timestamp: new Date()
              } as any); // Using 'as any' as a temporary workaround
              
              await chat.save();
              console.log(`Saved AI response to chat ${chatId}`);
            }
          } catch (error) {
            console.error("Error saving chat message:", error);
          }
        }
        
        // Emit 'queryResult' back to the client
        socket.emit("queryResult", {
          success: true,
          response,
          message: "Query Result",
          chatId // Send back the chat ID for client reference
        });
      } catch (error) {
        console.error("Error in searchquery event:", error);
        socket.emit("queryResult", {
          success: false,
          response: "",
          message: "Error occurred while processing query",
          chatId
        });
      }
    });

    // Handle socket disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected`);
    });
  };
}
