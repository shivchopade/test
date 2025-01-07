const express = require("express");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = 3000;

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// Middleware to serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Set up the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Home route
app.get("/", (req, res) => {
  res.render("index");
});

// Handle email form submission
app.post("/send", upload.single("attachment"), async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    const file = req.file;

    // Configure NodeMailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: `"Mailer App" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: `<p>${message}</p>`,
      attachments: file
        ? [
            {
              filename: file.originalname,
              path: file.path,
            },
          ]
        : [],
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.send("Email sent successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to send email.");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
