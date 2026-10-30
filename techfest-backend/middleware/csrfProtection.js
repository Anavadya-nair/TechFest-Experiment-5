const allowedOrigins = [
    "http://localhost:5173",
    "https://techfestexp5.netlify.app"
];
function csrfProtection(req, res, next) {
    const methodsToProtect = ["POST", "PUT", "PATCH", "DELETE"];

    if (!methodsToProtect.includes(req.method)) {
        return next();
    }

    const origin = req.get("Origin");

    if (!origin || !allowedOrigins.includes(origin)) {
        return res.status(403).json({
            message: "CSRF protection: Request origin not allowed"
        });
    }

    next();
}

module.exports = csrfProtection;
