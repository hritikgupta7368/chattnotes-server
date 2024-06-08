const express = require("express");
const router = express.Router();
const { getPrismaClient } = require("../../config/db");

const prisma = getPrismaClient();

router.get("/getContent", async (req, res) => {
  try {
    const { pageName } = req.body;
    const userId = req.user.id;

    // Find the page by name
    const page = await prisma.page.findUnique({
      where: {
        name: pageName,
        folder: {
          name: folderName,
          userId,
        },
      },
    });
    if (!page) {
      return res.status(404).json({ error: "Page not found" });
    }
    const content = await prisma.content.findMany({
      where: {
        pageId: page.id,
      },
    });
    res.status(200).json(content);
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({ error: "Failed to fetch content" });
  }
});

module.exports = router;
