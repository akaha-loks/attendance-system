const jwt = require("jsonwebtoken");

const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(
        token,

        process.env.JWT_SECRET,
      );

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          message: "Пользователь не найден",
        });
      }

      if (user.role === "inactive") {
        return res.status(403).json({
          message: "Аккаунт деактивирован",
        });
      }

      req.user = user;

      next();
    } catch (error) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      message: "No token",
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Только для администратора",
    });
  }

  next();
};

module.exports = {
  protect,

  adminOnly,
};
