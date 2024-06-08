const express = require("express");
const router = express.Router();
const { getPrismaClient } = require("../../config/db");
const {
  defaultLimiter,
} = require("../../rate-limiter/rate-limiter-middleware");
const prisma = getPrismaClient();

router.get("/user", defaultLimiter, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name,
      isVerified: user.isVerified,
    }); // Return the user object
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json({ error: "Failed to retrieve user" });
  }
});

module.exports = router;
