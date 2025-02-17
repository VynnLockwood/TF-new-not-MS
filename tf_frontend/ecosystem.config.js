module.exports = {
    apps: [
      {
        name: 'tf',
        script: 'node_modules/next/dist/bin/next',
        args: 'start', // Start the app in production mode
        cwd: './', // Make sure it's in the correct directory
        env: {
          NODE_ENV: 'production', // Set to production
        },
        watch: false, // Avoid watching files in production
        instances: 1, // Number of instances to run, 1 for single instance
        exec_mode: 'cluster', // Cluster mode for better performance
      },
    ],
  };
  