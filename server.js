const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ DEBUG START
console.log("🔥 NEW BACKEND VERSION RUNNING 🔥");

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

// ✅ RESET ADMIN USER
app.get("/create-admin-final", async (req, res) => {
  try {
    const hash = await bcrypt.hash("F@@tba118410", 10);

    // ✅ wipe DB
    await User.deleteMany({});

    // ✅ create clean admin
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


// ✅ DEBUG LOGIN ROUTE (FINAL)
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  console.log("🔥 LOGIN ATTEMPT RAW:", req.body);
  console.log("🔥 USERNAME:", JSON.stringify(username));
  console.log("🔥 PASSWORD:", JSON.stringify(password));

  // ✅ FORCE SUCCESS (TEST)
  if (username === "DAM8410" && password === "F@@tba118410") {
    console.log("✅ FORCE LOGIN SUCCESS");
    return res.json({
      success: true,
      user: {
        username: "DAM8410",
        tokens: 100000000,
        isAdmin: true
      }
    });
  }

  console.log("❌ LOGIN FAILED");
  res.json({ success: false });
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