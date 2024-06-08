const express = require("express");
const router = express.Router();
const { getPrismaClient } = require("../../config/db");
const { authLimiter } = require("../../rate-limiter/rate-limiter-middleware");
const geoip = require("geoip-lite");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const prisma = getPrismaClient();

router.post(
  "/user/register",
  authLimiter,
  [
    // Validation rules
    body("name")
      .notEmpty()
      .withMessage("Name is required.")
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters.")
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage("Name must contain only letters and spaces."),

    body("email")
      .notEmpty()
      .withMessage("Email is required.")
      .isEmail()
      .withMessage("Invalid email format.")
      .normalizeEmail() // Convert to lowercase, remove dots in Gmail addresses, etc.
      .isLength({ max: 255 })
      .withMessage("Email must not exceed 255 characters."),

    body("password")
      .notEmpty()
      .withMessage("Password is required.")
      .isLength({ min: 8, max: 128 })
      .withMessage("Password must be between 8 and 128 characters.")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
      )
      .withMessage(
        "Password must include lowercase, uppercase, number, and special character."
      ),

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

    const { name, email, password, ipAddress } = req.body;

    try {
      // Check if email is already in use
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: "Email is already in use." });
      }

      // Hash the password
      const saltRounds = 12; // High enough to be secure, not so high it's slow
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Validate and parse IP address
      let country, city, timezone;
      try {
        const geo = geoip.lookup(ipAddress);
        if (geo) {
          country = geo.country;
          city = geo.city;
          timezone = geo.timezone;
        }
      } catch (geoError) {
        console.warn("Error looking up IP geo data:", geoError);
      }

      // Create the user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          registrationIp: ipAddress,
          country,
          city,
          timezone,
          isVerified: true,
          lastLoginAt: new Date(), // Consider this as their first login
        },
      });

      // Respond without sending back sensitive data
      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        country: user.country,
        city: user.city,
        timezone: user.timezone,
      });
    } catch (error) {
      console.error("Error registering user:", error);

      if (error.code === 11000) {
        // MongoDB duplicate key error (just in case)
        res.status(409).json({ error: "Email is already in use." });
      } else if (error.code === "P2025") {
        // Prisma's "Record not found" error (unlikely here)
        res
          .status(500)
          .json({ error: "Database constraint violation. Please try again." });
      } else if (error instanceof bcrypt.Error) {
        res
          .status(500)
          .json({ error: "Error processing password. Please try again." });
      } else if (error.code === "ECONNREFUSED") {
        res.status(500).json({
          error: "Service temporarily unavailable. Please try again later.",
        });
      } else {
        res
          .status(500)
          .json({ error: "Failed to register user. Please try again." });
      }
    }
  }
);

module.exports = router;
