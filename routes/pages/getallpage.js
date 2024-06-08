const express = require("express");
const router = express.Router();
const { getPrismaClient } = require("../../config/db");

const prisma = getPrismaClient();

router.get("/pages", async (req, res) => {
  try {
    const { folderName } = req.body;
    const userId = req.user.id;

    // Find the folder by name
    const folder = await prisma.folder.findUnique({
      where: {
        name: folderName,
        user: {
          id: userId,
        },
      },
    });

    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    // Get all pages of the folder
    const pages = await prisma.page.findMany({
      where: {
        folderId: folder.id,
      },
    });

    res.json(pages);
  } catch (error) {
    console.error("Error fetching pages:", error);
    res.status(500).json({ error: "Failed to fetch pages" });
  }
});

module.exports = router;
