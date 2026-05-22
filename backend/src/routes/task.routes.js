const express = require("express");
const { body } = require("express-validator");
const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controllers/task.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.get("/", getAllTasks);
router.post(
  "/",
  [
    body("title").trim().notEmpty().withMessage("Task title is required"),
    body("projectId").notEmpty().withMessage("Project ID is required"),
  ],
  createTask
);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

module.exports = router;