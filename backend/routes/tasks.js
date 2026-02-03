const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const User = require("../models/User");
const auth = require("../middleware/auth");

// Get tasks based on role
// Get tasks based on role
router.get("/", auth, async (req, res) => {
  console.log("=== GET TASKS REQUEST ===");
  console.log("User ID:", req.userId);

  try {
    const user = await User.findById(req.userId);
    console.log("User found:", user ? "YES" : "NO");
    console.log("User role:", user?.role);

    let tasks;

    // Club leads and project leads see ALL tasks
    if (user.role === "club_lead" || user.role === "project_lead") {
      console.log("Fetching all tasks for leader");
      tasks = await Task.find()
        .populate("createdBy", "name email")
        .populate("assignedTo", "name email")
        .populate("reviewedBy", "name email")
        .sort({ createdAt: -1 });
    } else {
      console.log("Fetching assigned tasks for member");
      // Members only see tasks assigned to them
      tasks = await Task.find({ assignedTo: req.userId })
        .populate("createdBy", "name email")
        .populate("assignedTo", "name email")
        .populate("reviewedBy", "name email")
        .sort({ createdAt: -1 });
    }

    console.log("Tasks found:", tasks.length);
    res.json(tasks);
  } catch (error) {
    console.error("GET TASKS ERROR:", error);
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
      project: "not_started", // ADD THIS
    });

    console.log("About to save task:", task);
    await task.save();
    console.log("Task saved successfully!");

    // Populate the user info before sending response
    await task.populate("createdBy", "name email");
    await task.populate("assignedTo", "name email");

    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update task (only leaders can update any task, members can only update their own)
// Update task with review workflow
router.put("/:id", auth, async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      project,
      feedback,
    } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const user = await User.findById(req.userId);
    const isLeader = user.role === "club_lead" || user.role === "project_lead";
    const isAssignedMember = task.assignedTo.toString() === req.userId;

    // Permission checks
    if (!isLeader && !isAssignedMember) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this task" });
    }

    // Members can only submit for review or work on needs_revision tasks
    if (!isLeader && task.project === "approved") {
      return res.status(403).json({ message: "Cannot edit approved tasks" });
    }

    // Update basic fields
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (project !== undefined) task.project = project;

    // Handle status changes
    if (project) {
      // Leaders can approve or request revisions
      if (
        isLeader &&
        (project === "approved" || project === "needs_revision")
      ) {
        task.project = project;
        task.reviewedBy = req.userId;
        task.reviewedAt = new Date();
        if (feedback) task.feedback = feedback;
      }
      // Members can submit for review
      else if (isAssignedMember && project === "submit_for_review") {
        task.project = project;
        task.feedback = ""; // Clear previous feedback
      }
      // Members can move back to in_progress from needs_revision
      else if (
        isAssignedMember &&
        project === "in_progress" &&
        task.project === "needs_revision"
      ) {
        task.project = project;
      } else {
        task.project = project;
      }
    }

    // Only leaders can reassign tasks
    if (assignedTo && isLeader) {
      task.assignedTo = assignedTo;
    }

    await task.save();
    await task.populate("createdBy", "name email");
    await task.populate("assignedTo", "name email");
    if (task.reviewedBy) {
      await task.populate("reviewedBy", "name email");
    }

    res.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
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
