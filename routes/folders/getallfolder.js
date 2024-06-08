const express = require("express");
const router = express.Router();
const { getPrismaClient } = require("../../config/db");

const prisma = getPrismaClient();

router.get("/folders", async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all folders for the user
    const folders = await prisma.folder.findMany({
      where: {
        userId,
      },
    });

    res.json(folders);
  } catch (error) {
    console.error("Error fetching folders:", error);
    res.status(500).json({ error: "Failed to fetch folders" });
  }
});

module.exports = router;
