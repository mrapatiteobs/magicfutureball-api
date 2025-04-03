export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    try {
      const data = req.body;

      const recaptchaToken = data["g-recaptcha-response"];
      if (!recaptchaToken) {
        return res.status(400).json({ success: false, message: "Missing reCAPTCHA token" });
      }

      // ✅ Verify reCAPTCHA token with Google
      const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: recaptchaToken,
        }),
      });

      const verification = await verifyRes.json();
      console.log("🔍 reCAPTCHA verification:", verification); // Optional for debugging

      if (!verification.success) {
        return res.status(403).json({ success: false, message: "reCAPTCHA failed" });
      }

      // ✅ Forward to your Google Sheets Web App
      const sheetRes = await fetch("https://script.google.com/macros/s/AKfycby5wcQ3RMSwm8Rnrd2vmAyNizWG1NjJJRM9ihmAkbzxFh3vgL6ix04d32_GMrkJWHNg6w/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          answer: data.answer
        }),
      });

      const sheetText = await sheetRes.text(); // Optional logging
      console.log("📋 Google Sheets response:", sheetText);

      return res.status(200).json({ success: true, message: "Saved to Google Sheets" });
    } catch (error) {
      console.error("❌ Server error:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  res.setHeader("Allow", ["POST", "OPTIONS"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
