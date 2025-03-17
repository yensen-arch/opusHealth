// pages/api/subscribe.js
import fs from "fs";
import path from "path";
import nodemailer from 'nodemailer';

// Rate limiting setup
const RATE_LIMIT_WINDOW = 5 * 60 * 1000;
const MAX_REQUESTS_PER_IP = 100;

// Store IP addresses and their request timestamps
const ipRequestLog = new Map();

// Configure Nodemailer
// const transporter = nodemailer.createTransport({
//   service: "Gmail", // Use your email provider
//   auth: {
//     user: process.env.EMAIL_USER, // Your email
//     pass: process.env.EMAIL_PASS, // Your app password
//   },
// });

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Implement rate limiting
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    // Check if this IP has made requests before
    if (ipRequestLog.has(clientIp)) {
      const requests = ipRequestLog.get(clientIp);

      // Filter out old requests outside the window
      const recentRequests = requests.filter(
        (timestamp) => Date.now() - timestamp < RATE_LIMIT_WINDOW
      );

      // Update the log with only recent requests
      ipRequestLog.set(clientIp, recentRequests);

      // Check if limit exceeded
      if (recentRequests.length >= MAX_REQUESTS_PER_IP) {
        return res.status(429).json({
          error: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests, please try again later",
        });
      }

      // Add current request timestamp
      recentRequests.push(Date.now());
      ipRequestLog.set(clientIp, recentRequests);
    } else {
      // First request from this IP
      ipRequestLog.set(clientIp, [Date.now()]);
    }

    const { email } = req.body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res
        .status(400)
        .json({ error: "INVALID_EMAIL", message: "Invalid email format" });
    }

    // Path to the data file
    const dataFilePath = path.join(process.cwd(), "data", "subscribers.json");

    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Read existing file or create empty array
    let subscribers = [];
    if (fs.existsSync(dataFilePath)) {
      const fileContent = fs.readFileSync(dataFilePath, "utf8");
      subscribers = JSON.parse(fileContent);
    }

    // Check if email already exists
    if (
      subscribers.some((sub) => sub.email.toLowerCase() === email.toLowerCase())
    ) {
      return res
        .status(409)
        .json({ error: "EMAIL_EXISTS", message: "Email already registered" });
    }

    // Add new subscriber with timestamp
    subscribers.push({
      email,
      registeredAt: new Date().toISOString(),
    });

    // Write back to file
    fs.writeFileSync(dataFilePath, JSON.stringify(subscribers, null, 2));

    // Send confirmation email
    // const mailOptions = {
    //   from: process.env.EMAIL_USER,
    //   to: email,
    //   subject: "Subscription Successful!",
    //   text: `Thank you for subscribing, ${email}! You'll now receive our updates.`,
    //   html: `<p>Thank you for subscribing, <strong>${email}</strong>! You'll now receive our updates.</p>`,
    // };

    // await transporter.sendMail(mailOptions);

    return res
      .status(200)
      .json({ success: true, message: "Subscription successful" });
  } catch (error) {
    console.error("Subscription error:", error);
    return res
      .status(500)
      .json({ error: "SERVER_ERROR", message: "Internal server error" });
  }
}
