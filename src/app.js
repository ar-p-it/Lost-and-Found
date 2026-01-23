require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require("./config/databse");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

// Log the environment immediately to debug
console.log("--------------------------------------");
console.log("🚀 STARTING SERVER");
console.log("📂 Current NODE_ENV:", process.env.NODE_ENV);
console.log("📂 Current Directory:", __dirname);
console.log("--------------------------------------");

app.use(express.json());
app.use(cookieParser());

// Updated CORS to work for both Localhost and Production
const corsOptions = {
  origin: [
    "http://localhost:5173", 
    "https://lost-and-found-ssvd.onrender.com" // Your Render URL
  ],
  credentials: true,
};
app.use(cors(corsOptions));

const authRouter = require("./routes/auth");
const postRouter = require("./routes/postrouter");
const hubRouter = require("./routes/hubrouter");
const chatRouter = require("./routes/chatrouter");
const hubCommunityRouter = require("./routes/hubCommunityRouter");
const verificationRouter = require("./routes/verification");

app.use("/", authRouter);
app.use("/", postRouter);
app.use("/", hubRouter);
app.use("/", chatRouter);
app.use("/", hubCommunityRouter);
app.use("/api/verification", verificationRouter);

// serve frontend
if (process.env.NODE_ENV === "production") {
  const frontendDistPath = path.join(__dirname, "../clientfromdev/dist");
  
  console.log("✅ PRODUCTION MODE: Serving frontend from:", frontendDistPath);

  // Serve the static files (CSS, JS, Images)
  app.use(express.static(frontendDistPath));

  // Handle React routing (Return index.html for all other routes)
  app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(frontendDistPath, "index.html"), (err) => {
      if (err) {
        console.error("❌ ERROR sending index.html:", err);
        res.status(500).send("Error loading frontend.");
      }
    });
  });
} else {
  console.log("⚠️ DEV MODE: Not serving frontend static files.");
  app.get("/", (req, res) => {
    res.send("API is running in Dev Mode. (Frontend not served)");
  });
}

// Connect DB & Start Server
connectDB()
  .then(() => {
    console.log("DB connection Success");
    const PORT = process.env.PORT || 7777; 
    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err.message);
  });

module.exports = app;