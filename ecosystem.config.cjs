module.exports = {
  apps: [
    {
      name: "simple-media-gallery",
      cwd: "D:/projects/simple-media-gallery",

      script: ".next/standalone/server.js",

      autorestart: true,
      restart_delay: 5000,

      max_memory_restart: "1G",

      env: {
        NODE_ENV: "production",
        PORT: 5008
      }
    }
  ]
};