
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");

const logger = require("./middleware/logger");
const errors = require("./middleware/errorHandler");
const csrfProtection = require("./middleware/csrfProtection");

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

// Parse JSON requests
app.use(express.json({ limit: "10kb" }));

// Parse cookies
app.use(cookieParser());

// Prevent NoSQL injection
app.use(mongoSanitize());

// CSRF protection
app.use(csrfProtection);

// Log requests
app.use(logger);

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/events", require("./routes/events"));
app.use("/api/registrations", require("./routes/registrations"));

// 404 handler
app.use(errors.notFound);

// Central error handler
app.use(errors.errorHandler);

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");

        app.listen(process.env.PORT || 5000, () => {
            console.log("Server running on port " + (process.env.PORT || 5000));
        });
    })
    .catch((err) => {
        console.log("DB error:", err.message);
    });
