import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";
import http from "http";
import connectDB from "./config/db";
import { ChatController } from "./controllers/Chat/ChatController";

// Routes
const registerRoute = require("./routes/Auth/RegisterRoute");
import authRouter from "./routes/Auth/auth.route";
import Dashboardrouter from "./routes/Dashboard/SettingRoutes";
import Consultationrouter from "./routes/Dashboard/ConsultationRoutes";
import PaymentRouter from "./routes/Payment/PaymentRoutes";
import AdminRouter from "./routes/Admin/AdminRoutes";
import ChatGptRoute from "./routes/ChatGptRoute";
import DocumentsRouter from "./routes/Documents/documents.route";

// 1) Load env
dotenv.config();

// 2) Create Express and HTTP server
const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);

// 3) Trust proxy if needed
app.set("trust proxy", 1);
console.log("Trust proxy is set:", app.get("trust proxy"));

// 4) Connect to DB
connectDB();

// 5) Express-level CORS (FROM NEW CODE)
const allowedOrigins = (process.env.CORS_ORIGIN || "").split(",").map((o) => o.trim());
console.log("allowedOrigins array:", allowedOrigins);

app.use(
  cors({
    origin: allowedOrigins, // from new code
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// 6) Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 7) Rate limiter
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 60,                  // block after 60 requests
  })
);

// 8) Use routes
app.use("/api/register", registerRoute);
app.use("/api/auth", authRouter);
app.use("/api/dashboard", Dashboardrouter);
app.use("/api/consult", Consultationrouter);
app.use("/api/pay", PaymentRouter);
app.use("/api/admin", AdminRouter);
app.use("/api/chatgpt", ChatGptRoute);
app.use("/api/documents", DocumentsRouter);

// 9) Socket.io CONFIG (REVERTED TO OLD WORKING CODE)
const io = new Server(server, {
  cors: {
    origin: "*",   // <--- revert to '*'
    methods: ["GET", "POST"],
    credentials: false,
  },
});

// 10) Chat Controller
const socketController = new ChatController(io);

io.on("connection", (socket) => {
  console.log("Socket.io connection established. Socket ID:", socket.id);
  socketController.initializeConnection(socket);

  socket.on("connect_error", (err) => {
    console.log(`Connection error: ${err.message}`);
  });
});

// 11) Simple test route
app.get("/", (req, res) => {
  res.json({ message: "Hello from the local server (hybrid config)!" });
});

// 12) Conditionally start server if not Vercel

// 13) Export for Vercel
export default app;
