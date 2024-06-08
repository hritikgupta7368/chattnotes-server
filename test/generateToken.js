const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

//test route to generate jwt token
router.post("/token", (req, res) => {
  const payload = { id: "6662a4e8b22dd41403c6ab0d" }; // Replace with the user ID or any other relevant data
  const secretKey = process.env.JWT_SECRET; // Replace with your secret key

  const token = jwt.sign(payload, secretKey, { expiresIn: "1h" }); // Set the expiration time as needed

  res.json({ token });
});

module.exports = router;
