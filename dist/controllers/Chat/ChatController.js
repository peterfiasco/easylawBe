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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const AISearchService_1 = require("../AI/AISearchService");
class ChatController {
    constructor(io) {
        this.initializeConnection = (socket) => __awaiter(this, void 0, void 0, function* () {
            console.log("Initialize the socket");
            // Listen for the 'searchquery' event
            socket.on("searchquery", (_a) => __awaiter(this, [_a], void 0, function* ({ query, model }) {
                try {
                    console.log("searchquery event triggered. query:", query, "model:", model);
                    // Provide an empty array as chatHistory
                    // or pass any existing array of messages if you have it
                    const response = yield (0, AISearchService_1.GenerateLegalAdvise)(query, []);
                    // Emit 'queryResult' back to the client
                    socket.emit("queryResult", {
                        success: true,
                        response,
                        message: "Query Result",
                    });
                }
                catch (error) {
                    console.error("Error in searchquery event:", error);
                    socket.emit("queryResult", {
                        success: false,
                        response: "",
                        message: "Error occurred while processing query",
                    });
                }
            }));
            // Handle socket disconnection
            socket.on("disconnect", () => {
                console.log(`User disconnected`);
            });
        });
        this.io = io;
    }
}
exports.ChatController = ChatController;
