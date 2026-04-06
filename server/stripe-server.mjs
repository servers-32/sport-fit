/**
 * Локальный API для Stripe PaymentIntent.
 * Запуск: STRIPE_SECRET_KEY=sk_test_... node server/stripe-server.mjs
 * Порт 4242; Vite (npm run dev) проксирует /create-payment-intent → сюда.
 *
 * Суммы (центы EUR): monthly 4500 (45 €), annual 36000 (360 € год) — правьте под договор.
 */
import express from "express";
import Stripe from "stripe";

const PORT = Number(process.env.STRIPE_SERVER_PORT || 4242);
const key = process.env.STRIPE_SECRET_KEY;

const AMOUNT_CENTS = {
  monthly: 4500,
  annual: 36000,
};

const app = express();
app.use(express.json({ limit: "32kb" }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.post("/create-payment-intent", async (req, res) => {
  if (!key || !key.startsWith("sk_")) {
    res.status(500).json({
      error:
        "STRIPE_SECRET_KEY не задан или неверный. Укажите секретный ключ Stripe (sk_test_...).",
    });
    return;
  }

  const stripe = new Stripe(key);
  try {
    const plan = req.body && req.body.plan === "annual" ? "annual" : "monthly";
    const email =
      typeof req.body.email === "string" ? req.body.email.trim() : "";
    const amount = AMOUNT_CENTS[plan] ?? AMOUNT_CENTS.monthly;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      payment_method_types: ["card"],
      receipt_email: email || undefined,
      metadata: { plan, source: "sportfit-checkout" },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (e) {
    const msg = e && e.message ? e.message : "Stripe error";
    res.status(500).json({ error: msg });
  }
});

app.listen(PORT, () => {
  console.log(
    `[SportFit] Stripe API: http://127.0.0.1:${PORT}/create-payment-intent`
  );
});
