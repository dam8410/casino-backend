const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const Stripe = require("stripe");

const app = express();

app.use(cors());
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// ✅ STRIPE (IMPORTANT)
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

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

// ✅ LOGIN
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
    console.log(err);
    res.json({ success: false });
  }
});

// ✅ UPDATE TOKENS
app.post("/update-tokens", async (req, res) => {
  try {
    const { username, tokens } = req.body;

    await User.updateOne({ username }, { tokens });

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.json({ success: false });
  }
});

// ✅ ✅ ✅ STRIPE CHECKOUT ROUTE (THIS IS WHAT YOU WERE MISSING)
app.post("/create-checkout", async (req, res) => {
  try {
    console.log("✅ Stripe route hit");

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

    console.log("✅ Stripe session created");

    res.json({ url: session.url });

  } catch (err) {
    console.error("❌ STRIPE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ ROOT
app.get("/", (req, res) => {
  res.send("🎰 Casino Backend Running");
});

// ✅ START SERVER
const PORT = process.env.PORT || 3001;

// ✅ STRIPE WEBHOOK (AUTO CREDIT CHIPS)
app.post("/webhook", async (req, res) => {
  try {
    const event = req.body;

    console.log("✅ Webhook received:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      console.log("✅ Payment complete");

      // ✅ TEMP: GIVE CHIPS TO TEST USER
      await User.updateOne(
        { username: "DAM8410" },
        { $inc: { tokens: 100000 } }
      );

      console.log("✅ Chips added");
    }

    res.sendStatus(200);

  } catch (err) {
    console.error("❌ WEBHOOK ERROR:", err);
    res.sendStatus(500);
  }
});


app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
``