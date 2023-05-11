module.exports = {
    apps: [
        {
            name: "lft-web",
            script: "./server.js",
            watch: true,
            env: {
                "PORT": 3000,
                "NODE_ENV": "development"
            },
            env_production: {
                "PORT": 3001,
                "NODE_ENV": "production",
            }
        }
    ]
}