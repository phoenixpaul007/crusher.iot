module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add fallback for react-transition-group
      webpackConfig.resolve = {
        ...webpackConfig.resolve,
        fallback: {
          ...webpackConfig.resolve.fallback,
          "react-transition-group": require.resolve("react-transition-group"),
        },
      };
      return webpackConfig;
    },
  },
};