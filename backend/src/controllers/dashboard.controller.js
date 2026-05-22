const prisma = require("../utils/prismaClient");
const ApiResponse = require("../utils/ApiResponse");

const getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const userProjects = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true },
    });

    const projectIds = userProjects.map((p) => p.projectId);

    const [
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      overdueTasks,
      totalProjects,
      myTasks,
    ] = await Promise.all([
      prisma.task.count({ where: { projectId: { in: projectIds } } }),
      prisma.task.count({ where: { projectId: { in: projectIds }, status: "TODO" } }),
      prisma.task.count({ where: { projectId: { in: projectIds }, status: "IN_PROGRESS" } }),
      prisma.task.count({ where: { projectId: { in: projectIds }, status: "DONE" } }),
      prisma.task.count({
        where: {
          projectId: { in: projectIds },
          dueDate: { lt: now },
          status: { not: "DONE" },
        },
      }),
      prisma.project.count({ where: { id: { in: projectIds } } }),
      prisma.task.count({ where: { assignedToId: userId, status: { not: "DONE" } } }),
    ]);

    const recentTasks = await prisma.task.findMany({
      where: { projectId: { in: projectIds } },
      include: {
        assignedTo: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    res.status(200).json(
      new ApiResponse(200, {
        stats: {
          totalProjects,
          totalTasks,
          todoTasks,
          inProgressTasks,
          doneTasks,
          overdueTasks,
          myTasks,
        },
        recentTasks,
      }, "Dashboard stats fetched successfully")
    );
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats };