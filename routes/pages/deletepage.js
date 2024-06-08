const express = require("express");
const router = express.Router();
const { getPrismaClient } = require("../../config/db");

const prisma = getPrismaClient();

router.delete("/deletepage", async (req, res) => {
  try {
    const { folderName, pageName } = req.body;

    const userId = req.user.id;

    // Delete the page
    const deleteCount = await prisma.page.deleteMany({
      where: {
        name: pageName,
        folder: {
          name: folderName,
          userId,
        },
      },
    });

    if (deleteCount === 0) {
      return res.status(404).json({ error: "Page not found" });
    }

    res.status(204).end();
  } catch (error) {
    console.error("Error deleting page:", error);
    res.status(500).json({ error: "Failed to delete page" });
  }
});

module.exports = router;
