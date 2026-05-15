const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ CONNECT TO MONGO FIRST
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
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

// ✅ CREATE ADMIN (ONLY ONE VERSION!)
app.get("/create-admin-final", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.send("❌ DB not connected yet");
    }

    const hash = await bcrypt.hash("F@@tba118410", 10);

    await User.deleteMany({ username: "DAM8410" });

    await User.create({
      username: "DAM8410",
      password: hash,
      tokens: 100000000,
      isAdmin: true
    });

    res.send("✅ ADMIN CREATED");
  } catch (err) {
    console.log("ERROR:", err);
    res.send("ERROR: " + err.message);
  }
});

// ✅ LOGIN ROUTE
