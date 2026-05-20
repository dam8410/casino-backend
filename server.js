const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const Stripe = require("stripe");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ STRIPE (uses environment variable)
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ CONNECT TO DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Mongo Connected"))
  .catch(err => console.log("DB Error:", err));

// ✅ USER MODEL
const User = mongoose.model("User", {
  username: String,
  password: String,
  tokens: Number,
  isAdmin: Boolean
});


// ==========================
// ✅ TEST ROUTE
// ==========================
app.get("/test", (req, res) => {
  res.send("✅ TEST ROUTE WORKING");
});


// ==========================
// ✅ LOGIN
// ==========================
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.json({ success: false });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.json({ success: false });

    res.json({
      success: true,
      user: {
        username: user.username,
        tokens: user.tokens,
        isAdmin: user.isAdmin
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.json({ success: false });
  }
});


// ==========================
// ✅ UPDATE CHIPS
// ==========================
app.post("/update-tokens", async (req, res) => {
  try {
    const { username, tokens } = req.body;

    await User.updateOne({ username }, { tokens });

    res.json({ success: true });

  } catch (err) {
    console.error("TOKEN ERROR:", err);
    res.json({ success: false });
  }
});


// ==========================
// ✅ STRIPE CHECKOUT (FIXED)
// ==========================
app.post("/create-checkout", async (req, res) => {
  try {
    console.log("✅ Stripe route hit");

    // 🔴 Debug: confirm key exists
    console.log("Stripe key:", process.env.STRIPE_SECRET_KEY ? "FOUND ✅" : "MISSING ❌");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "100,000 Casino Chips"
            },
            unit_amount: 500
          },
          quantity: 1
        }
      ],

      success_url: "https://project-pjv5i.vercel.app",
      cancel_url: "https://project-pjv5i.vercel.app"
    });

    console.log("✅ Stripe session created:", session.url);

    res.json({ url: session.url });

  } catch (err) {
    console.error("❌ STRIPE FULL ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});



// ==========================
// ✅ ROOT
// ==========================
app.get("/", (req, res) => {
  res.send("Casino Backend Running ✅");
});


// ==========================
// ✅ START SERVER
// ==========================
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
