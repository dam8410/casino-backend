const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ PROOF SERVER IS NEW
console.log("🔥 FINAL VERSION RUNNING 🔥");

// ✅ TEST ROUTE
app.get("/test", (req, res) => {
  res.send("TEST WORKING");
});

// ✅ LOGIN ROUTE (ALWAYS SUCCESS)
app.post("/login", (req, res) => {
  console.log("🔥 LOGIN ROUTE HIT 🔥");

  res.json({
    success: true,
    user: {
      username: "TEST_USER",
      tokens: 999999,
      isAdmin: true
    }
  });
});

// ✅ ROOT
app.get("/", (req, res) => {
  res.send("Backend running");
});

// ✅ START SERVER
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("🚀 Server started on port", PORT);
});