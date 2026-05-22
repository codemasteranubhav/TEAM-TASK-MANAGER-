const { validationResult } = require("express-validator");
const prisma = require("../utils/prismaClient");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(400, "Validation failed", errors.array()));
    }

    const { title, description, status, priority, dueDate, projectId, assignedToId } = req.body;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return next(new ApiError(404, "Project not found"));
    }

    const isMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: req.user.id } },
    });
    if (!isMember) {
      return next(new ApiError(403, "You are not a member of this project"));
    }

    if (assignedToId) {
      const isAssigneeMember = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: assignedToId } },
      });
      if (!isAssigneeMember) {
        return next(new ApiError(400, "Assigned user is not a member of this project"));
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || "TODO",
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assignedToId: assignedToId || null,
        createdById: req.user.id,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(new ApiResponse(201, task, "Task created successfully"));
  } catch (error) {
    next(error);
  }
};

const getAllTasks = async (req, res, next) => {
  try {
    const { projectId, status, priority, assignedToId, page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (projectId) {
      const isMember = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: req.user.id } },
      });
      if (!isMember) {
        return next(new ApiError(403, "You are not a member of this project"));
      }
      where.projectId = projectId;
    } else {
      where.project = { members: { some: { userId: req.user.id } } };
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = assignedToId;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.task.count({ where }),
    ]);

    res.status(200).json(
      new ApiResponse(200, {
        tasks,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      }, "Tasks fetched successfully")
    );
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });

    if (!task) {
      return next(new ApiError(404, "Task not found"));
    }

    const isMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId: req.user.id } },
    });
    if (!isMember) {
      return next(new ApiError(403, "You are not a member of this project"));
    }

    res.status(200).json(new ApiResponse(200, task, "Task fetched successfully"));
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate, assignedToId } = req.body;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return next(new ApiError(404, "Task not found"));
    }

    const memberRecord = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId: req.user.id } },
    });
    if (!memberRecord) {
      return next(new ApiError(403, "You are not a member of this project"));
    }

    const isAdmin = memberRecord.role === "ADMIN";
    const isAssignee = task.assignedToId === req.user.id;

    if (!isAdmin && !isAssignee) {
      return next(new ApiError(403, "Only project admin or assigned member can update this task"));
    }

    if (!isAdmin && (title || description || priority || dueDate || assignedToId)) {
      return next(new ApiError(403, "Members can only update task status"));
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assignedToId !== undefined && { assignedToId }),
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });

    res.status(200).json(new ApiResponse(200, updated, "Task updated successfully"));
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return next(new ApiError(404, "Task not found"));
    }

    const memberRecord = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId: req.user.id } },
    });

    if (!memberRecord || memberRecord.role !== "ADMIN") {
      return next(new ApiError(403, "Only project admin can delete tasks"));
    }

    await prisma.task.delete({ where: { id } });

    res.status(200).json(new ApiResponse(200, null, "Task deleted successfully"));
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, getAllTasks, getTaskById, updateTask, deleteTask };