module.exports = {
  apps: [
    {
      name: "algorithm-api",
      script: "index.js",
      node_args: "--env-file=.env",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
