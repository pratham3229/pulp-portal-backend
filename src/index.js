require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const PulpDocument = require("./models/PulpDocument");
const authRoutes = require("./routes/auth");
const auth = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads", express.static("uploads"));

// MongoDB Connection
const username = encodeURIComponent("pratham3229");
const password = encodeURIComponent("pspd@123");
const uri = `mongodb+srv://${username}:${password}@cluster0.rc2vy.mongodb.net/downtime_data?retryWrites=true&w=majority`;

mongoose
  .connect(uri, {
    dbName: process.env.DATABASE_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// File Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Keep the original file extension
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage: storage });

// Auth Routes
app.use("/api/auth", authRoutes);

// Protected Routes
app.post("/api/submit", auth, async (req, res) => {
  try {
    const pulpDoc = new PulpDocument({
      ...req.body,
      userId: req.user._id,
    });
    await pulpDoc.save();
    res.status(201).json({ success: true, data: pulpDoc });
  } catch (error) {
    console.error("Error saving document:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/upload", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No file uploaded" });
    }
    res.status(200).json({
      success: true,
      filePath: req.file.path,
      fileName: req.file.filename,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Download endpoint
app.get("/api/download/:fileName", auth, (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, "../uploads", fileName);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: "File not found" });
  }

  // Send file
  res.download(filePath, (err) => {
    if (err) {
      console.error("Error downloading file:", err);
      res.status(500).json({ success: false, error: "Error downloading file" });
    }
  });
});

app.get("/api/documents", auth, async (req, res) => {
  try {
    const documents = await PulpDocument.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/documents/:id", auth, async (req, res) => {
  try {
    const document = await PulpDocument.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res
        .status(404)
        .json({ success: false, error: "Document not found" });
    }
    res.status(200).json({ success: true, data: document });
  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
