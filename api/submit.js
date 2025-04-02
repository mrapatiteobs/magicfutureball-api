export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

if (req.method === "POST") {
  try {
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const bodyStr = Buffer.concat(buffers).toString();
    const data = JSON.parse(bodyStr);

    console.log("📦 Form data received:", data); // 👈 Add this here

    return res.status(200).json({
      success: true,
      message: "Thanks!",
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
}


  res.setHeader("Allow", ["POST", "OPTIONS"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
