module.exports = {
  apps: [
    {
      name: "cocos-fashion-api",
      cwd: "/var/www/cocofashionbrands.com/current/server",
      script: "dist/index.js",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "400M",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
    },
  ],
};
