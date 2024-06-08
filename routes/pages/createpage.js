const express = require("express");
const router = express.Router();
const { getPrismaClient } = require("../../config/db");

const prisma = getPrismaClient();

router.post("/newpage", async (req, res) => {
  try {
    const { name, folderName } = req.body;

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

    // Create a new page for the user
    const newPage = await prisma.page.create({
      data: {
        title: name,
        folder: {
          connect: { id: folder.id },
        },
      },
    });

    res.status(201).json(newPage);
  } catch (error) {
    console.error("Error creating page:", error);
    res.status(500).json({ error: "Failed to create page" });
  }
});

module.exports = router;
