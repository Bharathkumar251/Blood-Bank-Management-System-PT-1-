const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");
const morgan = require("morgan");
const cors = require("cors");
const connectDB = require("./config/db");

// dot config
dotenv.config();

// MongoDB connection
connectDB();

// express app
const app = express();

// Middlewares
app.use(express.json());

// CORS
// CORS_ORIGINS = comma-separated list of allowed frontend origins,
// e.g. https://your-app.vercel.app (no trailing slash, no path).
// - Set (recommended): only those origins may call the API from a browser.
//   Local dev origins (localhost:3000/3001) are also allowed unless
//   DEV_MODE=production.
// - Not set: all origins are allowed (previous behaviour) and a warning is logged.
// Requests without an Origin header (curl, health checks, server-to-server) are not affected.
const isProduction =
  process.env.DEV_MODE === "production" || process.env.NODE_ENV === "production";
const configuredOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);
const localDevOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
];

if (configuredOrigins.length === 0) {
  console.warn(
    "WARNING: CORS_ORIGINS is not set - allowing requests from all origins. Set CORS_ORIGINS to your frontend URL."
  );
  app.use(cors());
} else {
  const allowedOrigins = isProduction
    ? configuredOrigins
    : [...configuredOrigins, ...localDevOrigins];
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(null, false);
      },
    })
  );
}

app.use(morgan("dev"));

// Health check (deployment only)
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Blood Bank Management System API is running",
  });
});

// Routes
app.use("/api/v1/test", require("./routes/testRoutes"));
app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/inventory", require("./routes/inventoryRoutes"));
app.use("/api/v1/analytics", require("./routes/analyticsRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));
app.use("/api/v1/locator", require("./routes/locatorRoutes"));
app.use("/api/v1/sos", require("./routes/sosRoutes"));
app.use("/api/v1/camps", require("./routes/campRoutes"));
app.use("/api/v1/ai", require("./routes/aiRoutes"));

// Port (Render provides PORT)
const PORT = process.env.PORT || 8080;

// Listen
app.listen(PORT, () => {
  console.log(
    `Node Server Running In ${process.env.DEV_MODE} Mode On Port ${PORT}`.bgBlue.white
  );
});