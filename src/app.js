const express = require("express");
const app = express();
const connectDB = require("./config/databse");
const cors = require("cors");
app.use(express.json());
const cookieParser = require("cookie-parser");

app.use(cookieParser());
// app.use(cors());
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));
// middleware

// root route
app.get("/", (req, res) => {
  res.send("Hello");
});

const authRouter = require("./routes/auth");
const postRouter = require("./routes/postrouter");
const hubRouter = require("./routes/hubrouter");
const chatRouter = require("./routes/chatrouter");




app.use("/", authRouter);
app.use("/", postRouter);
app.use("/", hubRouter);
app.use("/", chatRouter);

// connect DB then start server
connectDB()
  .then(() => {
    console.log("DB connection Success");

    const PORT = 7777;
    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err.message);
  });
