const express = require("express");
const cors = require("cors");
const multer = require("multer");
const bodyParser = require("body-parser");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3000;

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set up multer for handling multipart/form-data
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}.jpg`);
  },
});
const upload = multer({ storage: storage });

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(bodyParser.json({ limit: "10mb" })); // Increase limit if handling large images

// Route to save image
app.post("/save-image", upload.single("image"), (req, res) => {
  console.log("File received:", req.file); // Logs details of the uploaded file
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded." });
  }
  res.json({ success: true });
});

// Analyze images route
app.post("/analyze", (req, res) => {
  console.log("Analyzing images in:", uploadDir);

  // List files in the upload directory
  const files = fs.readdirSync(uploadDir);
  console.log("Files in directory:", files);

  // Spawn a Python process to run the prediction script
  const pythonProcess = spawn("python", ["predict.py", uploadDir]);

  let result = "";
  pythonProcess.stdout.on("data", (data) => {
    result += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`Python stderr: ${data}`);
  });

  pythonProcess.on("close", (code) => {
    if (code !== 0) {
      console.error(`Python process exited with code ${code}`);
      return res.status(500).json({
        error: "Error processing images.",
        details: result,
      });
    }

    try {
      const jsonResponse = JSON.parse(result); // Parse the valid JSON response
      res.json(jsonResponse); // Send the JSON response
    } catch (e) {
      console.error(`Error parsing response: ${e}`);
      console.error(`Response received: ${result}`);
      return res.status(500).json({
        error: "Error parsing the response from Python script.",
        details: result,
      });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
