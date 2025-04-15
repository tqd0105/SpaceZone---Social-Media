require("dotenv").config();

const env = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  CLIENT_URL: process.env.CLIENT_URL,
  UPLOAD_FOLDER: process.env.UPLOAD_FOLDER || "uploads",
};

module.exports = env;
