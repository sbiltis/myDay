const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const User = require("../models/User");
const auth = require("../middleware/auth");

// Get tasks based on role
router.get("/", auth, async (req, res) => {
  console.log("=== FETCHING TASKS ===");
  console.log("User ID:", req.userId);

  try {
    const user = await User.findById(req.userId);
    console.log("User role:", user.role);
    let tasks;

    // Club leads and project leads see ALL tasks
    if (user.role === "club_lead" || user.role === "project_lead") {
      console.log("Fetching ALL tasks for leader");
      tasks = await Task.find()
        .populate("createdBy", "name email")
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 });
    } else {
      console.log("Fetching only assigned tasks for member");
      // Members only see tasks assigned to them
      tasks = await Task.find({ assignedTo: req.userId })
        .populate("createdBy", "name email")
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 });
    }

    console.log("Found tasks count:", tasks.length);
    console.log("Tasks:", tasks);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get single task
router.get("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const user = await User.findById(req.userId);

    // Check if user has permission to view this task
    if (
      user.role === "member" &&
      task.assignedTo._id.toString() !== req.userId
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this task" });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create new task (anyone can create)
router.post("/", auth, async (req, res) => {
  console.log("=== CREATE TASK REQUEST ===");
  console.log("User ID:", req.userId);
  console.log("Request body:", req.body);

  try {
    const { title, description, priority, dueDate, assignedTo, project } =
      req.body;

    console.log("Assigned to user ID:", assignedTo);

    // Verify assignedTo user exists
    const assignedUser = await User.findById(assignedTo);
    console.log("Found assigned user:", assignedUser);

    if (!assignedUser) {
      return res.status(400).json({ message: "Assigned user not found" });
    }

    const task = new Task({
      createdBy: req.userId,
      assignedTo,
      title,
      description,
      priority,
      dueDate,
      project,
    });

    console.log("About to save task:", task);
    await task.save();
    console.log("Task saved successfully!");
    await task.save();

    // Populate the user info before sending response
    await task.populate("createdBy", "name email");
    await task.populate("assignedTo", "name email");

    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error); // ADD THIS
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update task (only leaders can update any task, members can only update their own)
router.put("/:id", auth, async (req, res) => {
  try {
    const {
      title,
      description,
      completed,
      priority,
      dueDate,
      assignedTo,
      project,
    } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const user = await User.findById(req.userId);

    // Members can only update tasks assigned to them
    if (user.role === "member" && task.assignedTo.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this task" });
    }

    // Update fields
    task.title = title || task.title;
    task.description =
      description !== undefined ? description : task.description;
    task.completed = completed !== undefined ? completed : task.completed;
    task.priority = priority || task.priority;
    task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;
    task.project = project !== undefined ? project : task.project;

    // Only leaders can reassign tasks
    if (
      assignedTo &&
      (user.role === "club_lead" || user.role === "project_lead")
    ) {
      task.assignedTo = assignedTo;
    }

    await task.save();
    await task.populate("createdBy", "name email");
    await task.populate("assignedTo", "name email");

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete task (only leaders can delete)
router.delete("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (user.role === "member") {
      return res.status(403).json({ message: "Only leaders can delete tasks" });
    }

    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users (for assigning tasks)
router.get("/users/all", auth, async (req, res) => {
  try {
    const users = await User.find().select("name email role");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
