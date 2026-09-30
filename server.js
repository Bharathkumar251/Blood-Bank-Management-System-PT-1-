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

// Enable CORS for all origins in development (supports localhost:3000, 3001, etc.)
app.use(cors());

app.use(morgan("dev"));

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

// Port
const PORT = process.env.PORT || 8080;

// Listen
app.listen(PORT, () => {
  console.log(
    `Node Server Running In ${process.env.DEV_MODE} Mode On Port ${PORT}` // Fixed: missing space before "On"
      .bgBlue.white
  );
});
