const express = require("express");
const router = express.Router();
const { getPrismaClient } = require("../../config/db");

const prisma = getPrismaClient();

router.delete("/deletefolder", async (req, res) => {
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

    // Delete the folder
    await prisma.folder.delete({
      where: {
        id: folder.id,
      },
    });

    res.status(204).end();
  } catch (error) {
    console.error("Error deleting folder:", error);
    res.status(500).json({ error: "Failed to delete folder" });
  }
});

module.exports = router;
