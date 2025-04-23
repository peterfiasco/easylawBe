import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit";
import { Server } from 'socket.io';
import http from 'http';
import connectDB from "./config/db";
import authRouter from "./routes/Auth/auth.route";
import Dashboardrouter from "./routes/Dashboard/SettingRoutes";
import Consultationrouter from "./routes/Dashboard/ConsultationRoutes";
import PaymentRouter from "./routes/Payment/PaymentRoutes";
import { ChatController } from "./controllers/Chat/ChatController";
import AdminRouter from "./routes/Admin/AdminRoutes";
import ChatGptRoute from './routes/ChatGptRoute';
import DocumentsRouter from "./routes/Documents/documents.route";
import userRoutes from './routes/User/UserRoutes';


const registerRoute = require("./routes/Auth/RegisterRoute");
const cors = require("cors");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);

// ✅ Trust the proxy BEFORE middleware
app.set("trust proxy", 1);
console.log("Trust proxy is set:", app.get("trust proxy")); // Debug log

// Connect to database (only once)
connectDB();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Create different rate limiters for different routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 login attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many login attempts, please try again after 15 minutes"
});

// More generous limiter for general API requests
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiters to specific routes instead of globally
app.use("/api/auth/login", authLimiter); // Stricter limits on login
app.use("/api/auth/register", authLimiter); // Stricter limits on register
app.use("/api", apiLimiter); // More generous limits for other API routes

// IMPORTANT: Remove the global rate limiter that was causing the issue
// app.use(
//   rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 60,
//   })
// );

app.use("/api/register", registerRoute);
app.use("/api/auth", authRouter);
app.use("/api/dashboard", Dashboardrouter);
app.use("/api/consult", Consultationrouter);
app.use("/api/pay", PaymentRouter);
app.use("/api/admin", AdminRouter);
app.use('/api/chatgpt', ChatGptRoute);
app.use("/api/documents", DocumentsRouter);
app.use('/api/consult', Consultationrouter);
app.use('/api/users', userRoutes);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: false,
  },
});

//socket middleware
const socketController = new ChatController(io);
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
export default app;
