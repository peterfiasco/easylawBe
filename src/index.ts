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
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);

app.use("/api/register", registerRoute);
app.use("/api/auth", authRouter);
app.use("/api/dashboard", Dashboardrouter);
app.use("/api/consult", Consultationrouter);
app.use("/api/pay", PaymentRouter);
app.use("/api/admin", AdminRouter);
app.use('/api/chatgpt', ChatGptRoute);
app.use("/api/documents", DocumentsRouter);








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
