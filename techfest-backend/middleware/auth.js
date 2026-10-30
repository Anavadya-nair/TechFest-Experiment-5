
const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  // Read JWT from HTTP-only cookie
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "Please login first"
    });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.clearCookie("token");
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admins only"
    });
  }

  next();
}

module.exports = { auth, adminOnly };
