const express = require("express");
const router = express.Router();
const { getPrismaClient } = require("../../config/db");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const { authLimiter } = require("../../rate-limiter/rate-limiter-middleware");
const { authenticateUser } = require("../../config/authenticateuser");
const jwt = require("jsonwebtoken");

const prisma = getPrismaClient();

router.post(
  "/user/signin",
  authLimiter,
  [
    // Validation rules (unchanged)
    body("email")
      .notEmpty()
      .withMessage("Email is required.")
      .isEmail()
      .withMessage("Invalid email format.")
      .normalizeEmail()
      .isLength({ max: 255 })
      .withMessage("Email must not exceed 255 characters."),

    body("password")
      .notEmpty()
      .withMessage("Password is required.")
      .isString()
      .withMessage("Password must be a string."),

    body("ipAddress")
      .notEmpty()
      .withMessage("IP Address is required.")
      .isIP()
      .withMessage("Invalid IP address format."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, ipAddress } = req.body;

    try {
      const authResult = await authenticateUser(email, password, ipAddress);

      // Generate JWT token
      const token = jwt.sign(
        { userId: authResult.user.id, email: authResult.user.email },
        process.env.JWT_SECRET,
        { expiresIn: "30d" } // Token expires in 30 days
      );

      // Update user with the latest token
      await prisma.user.update({
        where: { id: authResult.user.id },
        data: { latestJwtToken: token },
      });

      res.json({ ...authResult, token });
    } catch (error) {
      console.error("Error during sign-in:", error);

      // Error handling (unchanged)
      if (error.statusCode === 401) {
        res.status(401).json({ error: error.message });
      } else if (error.statusCode === 403) {
        res.status(403).json({ error: error.message });
      } else if (error instanceof bcrypt.Error) {
        res
          .status(500)
          .json({ error: "Error processing password. Please try again." });
      } else if (error.code === "ECONNREFUSED") {
        res.status(503).json({
          error: "Service temporarily unavailable. Please try again later.",
        });
      } else if (error.code === "P2025") {
        // Prisma's "Record not found" error (unlikely here)
        res
          .status(500)
          .json({ error: "Database inconsistency. Please contact support." });
      } else if (
        error.name === "TokenExpiredError" ||
        error.name === "JsonWebTokenError"
      ) {
        res.status(500).json({
          error: "Failed to generate access token. Please try again.",
        });
      } else {
        res.status(500).json({ error: "Sign-in failed. Please try again." });
      }
    }
  }
);

module.exports = router;
