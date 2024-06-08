const express = require("express");
const router = express.Router();
const { getPrismaClient } = require("../../config/db");
const {
  defaultLimiter,
} = require("../../rate-limiter/rate-limiter-middleware");
const prisma = getPrismaClient();

router.get("/deleteuser", defaultLimiter, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.delete({
      where: {
        id: userId,
      },
    });
    if (!userId) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json({ error: "Failed to retrieve user" });
  }
});

module.exports = router;
