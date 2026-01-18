
const express = require("express");
const app = express();
const connectDB = require("./config/databse");
const User = require("./models/user");
const bcrypt = require("bcrypt");

// ✅ middleware to parse JSON (good practice)
app.use(express.json());

// ✅ root route (DO NOT block all routes)
app.get("/", (req, res) => {
  res.send("Hello");
});

// ✅ hardcoded signup route
app.post("/signup", async (req, res) => {
  try {
    const passwordHash = await bcrypt.hash("password123", 10);

    const user = new User({
      firstName: "harddd",
      lastName: "Kumar",
      emailId: ".hardcode@test.com", // must be unique
      password: passwordHash,
      age: 23,
      gender: "male",
      photoUrl: "https://geographyandyou.com/images/user-profile.png",
      about: "Hardcoded user for testing 🚀",
      interests: ["coding", "music", "gym"],
      location: {
        city: "Delhi",
        country: "India",
      },
      lookingFor: "dating",
      height: 175,
    });

    const savedUser = await user.save();

    // ⚠️ never send password back
    savedUser.password = undefined;

    res.status(201).json({
      message: "Hardcoded user added successfully",
      user: savedUser,
    });
  } catch (err) {
    res.status(400).json({
      message: "Error adding user",
      error: err.message,
    });
  }
});

// ✅ connect DB first, then start server
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
