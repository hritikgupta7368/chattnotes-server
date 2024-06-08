const geoip = require("geoip-lite");
const bcrypt = require("bcrypt");
const { getPrismaClient } = require("./db");

const prisma = getPrismaClient();

/**
 * Authenticates a user by email, password, and IP address.
 *
 * @param {string} email - The email of the user.
 * @param {string} password - The password of the user.
 * @param {string} ipAddress - The IP address of the user.
 * @return {Promise<Object>} An object containing the authenticated user and other relevant information.
 * @throws {Error} If the email or password is invalid, or if the account is not verified.
 */

module.exports.authenticateUser = async (email, password, ipAddress) => {
  // Find the user by email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  // Compare the provided password with the stored hash
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  // Check if the account is verified
  if (!user?.isVerified) {
    const error = new Error(
      "Account not verified. Please check your email for verification instructions."
    );
    error.statusCode = 403;
    throw error;
  }

  // Geo-locate the IP address
  let country, city, timezone;
  try {
    const geo = geoip.lookup(ipAddress);
    if (geo) {
      country = geo.country;
      city = geo.city;
      timezone = geo.timezone;
    }
  } catch (geoError) {
    console.warn("Error looking up IP geo data:", geoError);
  }

  // Update last login info
  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastLoginAt: new Date(),
    },
  });

  // Return the authenticated user and other relevant information
  return {
    user,
  };
};
