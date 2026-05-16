const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ CONNECT TO MONGO
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ DB Connected");
  })
  .catch(err => {
    console.log("❌ DB Error:");
    console.log(err);   // VERY IMPORTANT
  });

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

// ✅ CREATE ADMIN
app.get("/create-admin-final", async (req, res) => {
  try {
    const hash = await bcrypt.hash("F@@tba118410", 10);

    // ✅ DELETE ALL USERS (IMPORTANT)
    await User.deleteMany({});

    // ✅ CREATE CLEAN USER
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

// ✅ LOGIN ROUTE
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("LOGIN ATTEMPT:", username, password);

    // 🔥 TEMP BYPASS (TEST ONLY)
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

  } catch (err) {
    console.log(err);
    res.json({ success: false });
  }
});
// ✅ ROOT ROUTE
app.get("/", (req, res) => {
  res.send("Casino backend running");
});

// ✅ START SERVER
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});