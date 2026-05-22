const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const prisma = require("../utils/prismaClient");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new ApiError(401, "Not authorized, no token"));
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return next(new ApiError(401, "User no longer exists"));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new ApiError(401, "Not authorized, invalid token"));
  }
};

module.exports = { protect };