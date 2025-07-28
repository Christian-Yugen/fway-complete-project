
require("dotenv").config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET || "supersecretjwtkey",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "supersecretjwtrefreshkey",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
};


