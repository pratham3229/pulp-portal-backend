require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { GridFSBucket } = require("mongodb");
const PulpDocument = require("./models/PulpDocument");
const authRoutes = require("./routes/auth");
const auth = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Root route for healthcheck
app.get("/", (req, res) => {
  const status = {
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  };
  res.status(200).json(status);
});

// Serve static files from uploads directory
app.use("/uploads", express.static("uploads"));

// MongoDB Connection
let bucket;

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    console.log("Attempting to connect to MongoDB...");
    console.log(
      "Connection string:",
      process.env.MONGO_URI.replace(/\/\/[^@]+@/, "//****:****@")
    );

    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DATABASE_NAME,
    });

    console.log("Connected to MongoDB");

    // Initialize GridFS bucket
    const db = mongoose.connection.db;
    bucket = new GridFSBucket(db, { bucketName: "uploads" });
    console.log("GridFS bucket initialized with bucket name: uploads");

    // Verify GridFS collections exist
    const collections = await db.listCollections().toArray();
    console.log(
      "Available collections:",
      collections.map((c) => c.name)
    );
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

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

    console.log("File upload started:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    if (!bucket) {
      console.error("GridFS bucket not initialized");
      return res
        .status(500)
        .json({ success: false, error: "Storage system not ready" });
    }

    // Create a new file in GridFS
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
    });

    console.log("Upload stream created with id:", uploadStream.id);

    // Write the buffer to GridFS
    uploadStream.write(req.file.buffer);
    uploadStream.end();

    uploadStream.on("finish", () => {
      console.log("File upload completed:", {
        fileId: uploadStream.id.toString(),
        filename: req.file.originalname,
      });
      res.status(200).json({
        success: true,
        fileId: uploadStream.id.toString(),
        fileName: req.file.originalname,
      });
    });

    uploadStream.on("error", (error) => {
      console.error("Error uploading file to GridFS:", error);
      res.status(500).json({ success: false, error: error.message });
    });
  } catch (error) {
    console.error("Error in upload handler:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Download endpoint
app.get("/api/download/:fileId", auth, async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.fileId);

    const files = await bucket.find({ _id: fileId }).toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ success: false, error: "File not found" });
    }

    const file = files[0];
    res.set("Content-Type", file.contentType || "application/octet-stream");
    res.set("Content-Disposition", `attachment; filename="${file.filename}"`);

    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.on("error", (error) => {
      console.error("Error streaming file:", error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: "Error streaming file" });
      }
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error("Error in download handler:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
