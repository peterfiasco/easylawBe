"use strict";
// import express from "express";
// import { VercelRequest, VercelResponse } from "@vercel/node";
// import dotenv from "dotenv";
// import bodyParser from "body-parser";
// import rateLimit from "express-rate-limit";
// import appRoot from "app-root-path";
// import path from "path";
// import http from "http";
// import connectDB from "./config/db";
// import authRouter from "./routes/Auth/auth.route";
// import Dashboardrouter from "./routes/Dashboard/SettingRoutes";
// import Consultationrouter from "./routes/Dashboard/ConsultationRoutes";
// import PaymentRouter from "./routes/Payment/PaymentRoutes";
// const registerRoute = require("./routes/Auth/RegisterRoute");
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const cors = require("cors");
// dotenv.config();
// const port = process.env.PORT;
// const app = express();
// // Enable CORS for all routes
// app.use(cors());
// const server = http.createServer(app);
// app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.use(
//   rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 60,
//   })
// );
// app.use("/api/register", registerRoute);
// app.use("/api/auth", authRouter);
// app.use("/api/dashboard", Dashboardrouter);
// app.use("/api/consult", Consultationrouter);
// app.use("/api/pay", PaymentRouter);
// app.use("/resources", express.static(path.join(appRoot.path, "src/resources")));
// app.get("/", (req, res) => {
//   res.json({ message: "Hello from Vercel Serverless Function!" });
// });
// server.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
//   //connect to DB
//   connectDB();
// });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const db_1 = __importDefault(require("./config/db"));
const auth_route_1 = __importDefault(require("./routes/Auth/auth.route"));
const SettingRoutes_1 = __importDefault(require("./routes/Dashboard/SettingRoutes"));
const ConsultationRoutes_1 = __importDefault(require("./routes/Dashboard/ConsultationRoutes"));
const PaymentRoutes_1 = __importDefault(require("./routes/Payment/PaymentRoutes"));
const ChatController_1 = require("./controllers/Chat/ChatController");
const AdminRoutes_1 = __importDefault(require("./routes/Admin/AdminRoutes"));
const ChatGptRoute_1 = __importDefault(require("./routes/ChatGptRoute"));
const documents_route_1 = __importDefault(require("./routes/Documents/documents.route"));
const registerRoute = require("./routes/Auth/RegisterRoute");
const cors = require("cors");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
const server = http_1.default.createServer(app);
// ✅ Trust the proxy BEFORE middleware
app.set("trust proxy", 1);
console.log("Trust proxy is set:", app.get("trust proxy")); // Debug log
// Connect to database (only once)
(0, db_1.default)();
app.use(cors());
app.use(express_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
app.use((0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 60,
}));
app.use("/api/register", registerRoute);
app.use("/api/auth", auth_route_1.default);
app.use("/api/dashboard", SettingRoutes_1.default);
app.use("/api/consult", ConsultationRoutes_1.default);
app.use("/api/pay", PaymentRoutes_1.default);
app.use("/api/admin", AdminRoutes_1.default);
app.use('/api/chatgpt', ChatGptRoute_1.default);
app.use("/api/documents", documents_route_1.default);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: false,
    },
});
//socket middleware
const socketController = new ChatController_1.ChatController(io);
io.on('connection', (socket) => {
    // console.log("socket", socket)
    socketController.initializeConnection(socket);
    socket.on('connect_error', (err) => {
        console.log(`Connection error: ${err.message}`);
    });
});
app.get("/", (req, res) => {
    res.json({ message: "Hello from the local server!" });
});
// ✅ Local development: Start the Express server only if not in a Vercel environment
if (process.env.NODE_ENV !== "vercel") {
    server.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}
// ✅ Export app for Vercel deployment
exports.default = app;
