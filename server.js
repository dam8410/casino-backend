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

    // ✅ DELETE EVERYTHING
    await User.deleteMany({});

    // ✅ CREATE CLEAN USER
    await User.create({
      username: "DAM8410",
      password: hash,
      tokens: 100000000,
      isAdmin: true
    });

    res.send("✅ ADMIN RESET & CREATED CLEAN");
  } catch (err) {
    console.log(err);
    res.send("ERROR: " + err.message);
  }
});

// ✅ LOGIN ROUTE
app.post("/login", async (req, res) => {
  try {
    console.log("LOGIN ATTEMPT:", req.body); // ✅ ADD THIS

    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      console.log("❌ USER NOT FOUND");
      return res.json({ success: false });
    }

    const valid = await bcrypt.compare(password, user.password);

    console.log("PASSWORD MATCH:", valid); // ✅ ADD THIS

    if (!valid) {
      return res.json({ success: false });
    }

    res.json({
      success: true,
      user: {
        username: user.username,
        tokens: user.tokens,
        isAdmin: user.isAdmin
      }
    });
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