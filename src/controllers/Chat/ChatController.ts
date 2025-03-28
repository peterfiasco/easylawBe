import { Server, Socket } from "socket.io";
import { GenerateLegalAdvise } from "../AI/AISearchService";

export class ChatController {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  public initializeConnection = async (socket: Socket) => {
    console.log("Initialize the socket");

    // Listen for the 'searchquery' event
    socket.on("searchquery", async ({ query, model }) => {
      try {
        console.log("searchquery event triggered. query:", query, "model:", model);
        
        // Provide an empty array as chatHistory
        // or pass any existing array of messages if you have it
        const response = await GenerateLegalAdvise(query, []);

        // Emit 'queryResult' back to the client
        socket.emit("queryResult", {
          success: true,
          response,
          message: "Query Result",
        });
      } catch (error) {
        console.error("Error in searchquery event:", error);
        socket.emit("queryResult", {
          success: false,
          response: "",
          message: "Error occurred while processing query",
        });
      }
    });

    // Handle socket disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected`);
    });
  };
}
