const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.REACT_APP_BACKEND_BASE_PATH,
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // Remove '/api' from the request URL
      },
    }),
  );
};
