const express = require("express");
const jwt = require("jsonwebtoken");
const Task = require("../models/Task");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// AUTHENTICATION MIDDLEWARE
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Access token required"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(403).json({
      message: "Invalid or expired token"
    });
  }
}

// GET ALL ACTIVE TASKS
router.get("/", authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({
      userId: req.user.userId,
      status: "pending"
    }).sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch tasks",
      error: error.message
    });
  }
});

// CREATE TASK
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Task title is required"
      });
    }

    const task = await Task.create({
      title,
      description,
      userId: req.user.userId
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create task",
      error: error.message
    });
  }
});

// MARK TASK AS DONE
router.put("/:id/done", authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    task.status = "done";
    task.completedAt = new Date();

    await task.save();

    res.json({
      message: "Task completed successfully",
      task
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to complete task",
      error: error.message
    });
  }
});

// DELETE TASK
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.json({
      message: "Task deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete task",
      error: error.message
    });
  }
});

module.exports = router;