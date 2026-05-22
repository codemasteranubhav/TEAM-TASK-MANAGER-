const { validationResult } = require("express-validator");
const prisma = require("../utils/prismaClient");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(400, "Validation failed", errors.array()));
    }

    const { name, description } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        createdById: req.user.id,
        members: {
          create: {
            userId: req.user.id,
            role: "ADMIN",
          },
        },
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });

    res.status(201).json(new ApiResponse(201, project, "Project created successfully"));
  } catch (error) {
    next(error);
  }
};

const getAllProjects = async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        members: { some: { userId: req.user.id } },
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(new ApiResponse(200, projects, "Projects fetched successfully"));
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true, email: true } },
            createdBy: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project) {
      return next(new ApiError(404, "Project not found"));
    }

    const isMember = project.members.some((m) => m.userId === req.user.id);
    if (!isMember) {
      return next(new ApiError(403, "You are not a member of this project"));
    }

    res.status(200).json(new ApiResponse(200, project, "Project fetched successfully"));
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return next(new ApiError(404, "Project not found"));
    }

    if (project.createdById !== req.user.id) {
      return next(new ApiError(403, "Only project admin can update this project"));
    }

    const updated = await prisma.project.update({
      where: { id },
      data: { name, description },
    });

    res.status(200).json(new ApiResponse(200, updated, "Project updated successfully"));
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return next(new ApiError(404, "Project not found"));
    }

    if (project.createdById !== req.user.id) {
      return next(new ApiError(403, "Only project admin can delete this project"));
    }

    await prisma.project.delete({ where: { id } });

    res.status(200).json(new ApiResponse(200, null, "Project deleted successfully"));
  } catch (error) {
    next(error);
  }
};

const addMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return next(new ApiError(404, "Project not found"));
    }

    if (project.createdById !== req.user.id) {
      return next(new ApiError(403, "Only project admin can add members"));
    }

    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) {
      return next(new ApiError(404, "User with this email not found"));
    }

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: userToAdd.id } },
    });
    if (existing) {
      return next(new ApiError(400, "User is already a member of this project"));
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId: id,
        userId: userToAdd.id,
        role: role === "ADMIN" ? "ADMIN" : "MEMBER",
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.status(201).json(new ApiResponse(201, member, "Member added successfully"));
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return next(new ApiError(404, "Project not found"));
    }

    if (project.createdById !== req.user.id) {
      return next(new ApiError(403, "Only project admin can remove members"));
    }

    if (userId === req.user.id) {
      return next(new ApiError(400, "You cannot remove yourself from the project"));
    }

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId: id, userId } },
    });

    res.status(200).json(new ApiResponse(200, null, "Member removed successfully"));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};