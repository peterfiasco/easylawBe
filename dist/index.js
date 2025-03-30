"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
// Debug environment variables
console.log("Environment variables:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);
console.log("CORS_ORIGIN:", process.env.CORS_ORIGIN);
console.log("JWT_SECRET length:", process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
// Don't log the actual secret for security reasons
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
const server = http_1.default.createServer(app);
// ✅ Trust the proxy BEFORE middleware
app.set("trust proxy", 1);
// Connect to database (only once)
(0, db_1.default)();
// Configure CORS based on environment
const allowedOrigins = (process.env.CORS_ORIGIN || "*")
    .split(',')
    .map(o => o.trim());
// Extra debug log to confirm which origins we’re allowing
console.log("Allowed origins array:", allowedOrigins);
app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
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
// Update the Socket.io CORS settings to match Express CORS settings
const io = new socket_io_1.Server(server, {
    cors: {
        origin: allowedOrigins, // Use the same origins as Express
        methods: ['GET', 'POST'],
        credentials: true, // Set to true to match Express
    },
});
// socket middleware
const socketController = new ChatController_1.ChatController(io);
io.on('connection', (socket) => {
    console.log("Socket connected:", socket.id);
    socketController.initializeConnection(socket);
    socket.on('connect_error', (err) => {
        console.log(`Connection error: ${err.message}`);
    });
});
app.get("/", (req, res) => {
    res.json({ message: "Hello from the local server!" });
});
// ✅ Local development: Start the Express server only if not in a Vercel environment
// ✅ Export app for Vercel/Render deployment
exports.default = app;
