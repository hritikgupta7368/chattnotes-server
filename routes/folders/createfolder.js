const express = require("express");
const router = express.Router();
const { getPrismaClient } = require("../../config/db");

const prisma = getPrismaClient();

router.post("/newfolder", async (req, res) => {
  try {
    const { name } = req.body;

    const userId = req.user.id;

    // Create a new folder for the user
    const newFolder = await prisma.folder.create({
      data: {
        name,
        user: {
          connect: { id: userId },
        },
      },
    });

    res.status(201).json(newFolder);
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ error: "Failed to create folder" });
  }
});

module.exports = router;
