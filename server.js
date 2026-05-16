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
  res.send("✅ TEST ROUTE WORKING");
});

// ✅ CREATE / RESET ADMIN (REMOVE AFTER USE)
app.get("/create-admin-final", async (req, res) => {
  try {
    const hash = await bcrypt.hash("F@@tba118410", 10);

    await User.deleteMany({});

    await User.create({
      username: "DAM8410",
      password: hash,
      tokens: 100000000,
      isAdmin: true
    });

    res.send("✅ ADMIN RESET COMPLETE");
  } catch (err) {
    console.log(err);
    res.send("ERROR: " + err.message);
  }
});

// ✅ SECURE LOGIN ROUTE
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.json({ success: false });
    }

    const valid = await bcrypt.compare(password, user.password);
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

// ✅ SAVE TOKENS (VERY IMPORTANT FOR GAME)
app.post("/update-tokens", async (req, res) => {
  try {
    const { username, tokens } = req.body;

    await User.updateOne(
      { username },
      { tokens }
    );

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.json({ success: false });
  }
});

// ✅ ROOT
app.get("/", (req, res) => {
  res.send("🎰 Casino Backend Running");
});

// ✅ START SERVER
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
