const express = require("express");
const { body } = require("express-validator");
const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require("../controllers/project.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.get("/", getAllProjects);
router.post(
  "/",
  [body("name").trim().notEmpty().withMessage("Project name is required")],
  createProject
);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);
router.post("/:id/members", addMember);
router.delete("/:id/members/:userId", removeMember);

module.exports = router;