/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
  server: process.env.NODE_ENV === "development" ? undefined : "./server.js",
  serverBuildPath: "api/index.js",
  future: {
    unstable_tailwind: true,
    v2_routeConvention: true,
  },
};
