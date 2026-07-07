const path = require("path");

require("dotenv").config({ path: path.join(__dirname, ".env") });

module.exports = {
  apps: [
    {
      name: "simple-media-gallery",
      cwd: __dirname,
      script: ".next/standalone/server.js",
      interpreter: "node",
      autorestart: true,
      restart_delay: 5000,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 5008,
        HOSTNAME: process.env.HOSTNAME || "0.0.0.0",
      },
    },
  ],
};
