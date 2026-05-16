const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ CONNECT TO MONGO
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ DB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

// ✅ USER MODEL
const User = mongoose.model("User", {
  username: String,
  password: String,
  tokens: Number,
  isAdmin: Boolean
});

// ✅ TEST ROUTE
app.get("/test", (req, res) => {
  res.send("TEST ROUTE WORKING");
});

// ✅ CREATE ADMIN (RESET USER CLEAN)
app.get("/create-admin-final", async (req, res) => {
  try {
    const hash = await bcrypt.hash("F@@tba118410", 10);

    // ✅ wipe all users
    await User.deleteMany({});

    // ✅ create clean user
    await User.create({
      username: "DAM8410",
      password: hash,
      tokens: 100000000,
      isAdmin: true
    });

    res.send("✅ ADMIN CLEAN RESET");
  } catch (err) {
    console.log(err);
    res.send("ERROR: " + err.message);
  }
});

// ✅ TEMP LOGIN FIX (BYPASS HASH CHECK)
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  console.log("LOGIN ATTEMPT:", username, password);

  // ✅ TEMP FORCE LOGIN SUCCESS (FINAL DEBUG STEP)
  if (username === "DAM8410" && password === "F@@tba118410") {
    return res.json({
      success: true,
      user: {
        username: "DAM8410",
        tokens: 100000000,
        isAdmin: true
      }
    });
  }

  return res.json({ success: false });
});

// ✅ ROOT
app.get("/", (req, res) => {
  res.send("Casino backend running");
});

// ✅ START SERVER
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});