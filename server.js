require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ==========================================
// MongoDB Connection with Auto In-Memory Fallback
// ==========================================
async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/taskmanager";

  try {
    console.log(`📡 Connecting to MongoDB: ${uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@")}`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
    console.log("✅ MongoDB connected successfully!");
    return;
  } catch (err) {
    console.warn(`⚠️ Could not connect to ${uri}: ${err.message}`);
  }

  // Auto-fallback to In-Memory MongoDB
  console.log("🔄 Starting In-Memory MongoDB fallback server...");
  try {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const mongod = await MongoMemoryServer.create();
    const memUri = mongod.getUri();
    await mongoose.connect(memUri);
    console.log(`✅ Connected to In-Memory MongoDB! URI: ${memUri}`);
    console.log("👉 Tip: Set MONGODB_URI in .env to persist tasks to Atlas or local MongoDB.");
  } catch (memErr) {
    console.error("❌ All MongoDB connection attempts failed:", memErr.message);
  }
}

connectDB();

// ==========================================
// Task Schema & Model
// ==========================================
const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Pending", "Ongoing", "Completed"],
      default: "Pending",
    },
    dueDate: { type: Date, default: null },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", TaskSchema);

// ==========================================
// API Endpoints
// ==========================================

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    dbName: mongoose.connection.name || "taskmanager",
    dbHost: mongoose.connection.host || "unknown",
  });
});

// GET all tasks (with optional status filter)
app.get("/tasks", async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ message: "Server error. Could not fetch tasks." });
  }
});

// GET single task by ID
app.get("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found." });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// POST create new task
app.post("/tasks", async (req, res) => {
  const { title, description, priority, dueDate } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Task title is required." });
  }
  const task = new Task({ title: title.trim(), description, priority, dueDate });
  try {
    const newTask = await task.save();
    console.log("📥 New task saved to MongoDB:", newTask._id);
    res.status(201).json(newTask);
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(400).json({ message: "Invalid data. Could not create task." });
  }
});

// PATCH update task status or other fields
app.patch("/tasks/:id", async (req, res) => {
  try {
    const { status, priority, title, description, dueDate } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (priority) updates.priority = priority;
    if (title) updates.title = title.trim();
    if (description !== undefined) updates.description = description;
    if (dueDate !== undefined) updates.dueDate = dueDate;

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    if (!updatedTask) return res.status(404).json({ message: "Task not found." });
    res.json(updatedTask);
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ message: "Server error. Could not update task." });
  }
});

// DELETE task
app.delete("/tasks/:id", async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) return res.status(404).json({ message: "Task not found." });
    console.log("🗑️ Task deleted from MongoDB:", req.params.id);
    res.json({ message: "Task deleted successfully." });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ message: "Server error. Could not delete task." });
  }
});

// DELETE all completed tasks
app.delete("/tasks", async (req, res) => {
  try {
    const result = await Task.deleteMany({ status: "Completed" });
    res.json({ message: `Deleted ${result.deletedCount} completed task(s).` });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ==========================================
// Start Server
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`👉 Open http://localhost:${PORT} in your browser to use the Task Manager!`);
});
