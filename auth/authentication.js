// authMiddleware.js
const jwt = require("jsonwebtoken");
const { getPrismaClient } = require("../config/db"); // Assuming you have a separate file for Prisma configuration

const prisma = getPrismaClient();

const authenticateUser = async (req, res, next) => {
  // Extract the JWT token from the request header
  const authHeader = req.header("Authorization");

  // Check if Authorization header exists
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header is required." });
  }

  // Check if the token is in the correct format (Bearer <token>)
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res
      .status(401)
      .json({ error: 'Authorization header format must be "Bearer <token>".' });
  }

  const token = parts[1];

  // Check if token exists
  if (!token) {
    return res.status(401).json({ error: "Authorization token is missing." });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set in the environment variables.");
      return res.status(500).json({ error: "Server configuration error." });
    }

    // // Check expiry time of token
    if (decoded.exp < Date.now() / 1000) {
      return res.status(401).json({ error: "Token has expired." });
    }

    // Check if the token payload has the expected structure
    if (!decoded.userId || typeof decoded.userId !== "string") {
      return res.status(401).json({ error: "Invalid token payload." });
    }

    // Check if the user exists in the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res
        .status(401)
        .json({ error: "User not found or token is invalid." });
    }

    // Check if the user is active or not banned (optional, based on your user model)
    if (user.isActive === false) {
      return res
        .status(403)
        .json({ error: "User account is inactive or banned." });
    }

    // Pass the user ID and other relevant user data down to other routes
    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token." });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token has expired." });
    } else {
      return res
        .status(500)
        .json({ error: "Internal server error during authentication." });
    }
  }
};

module.exports = authenticateUser;
