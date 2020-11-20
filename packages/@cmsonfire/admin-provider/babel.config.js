console.log("Babel for @cmsonfire/admin-provider");

module.exports = {
  presets: ["@babel/preset-env", "@babel/preset-react"],
  plugins: [
    "@babel/plugin-syntax-jsx",
    "@babel/plugin-transform-runtime",
    [
      "transform-react-remove-prop-types",
      {
        removeImport: true,
      },
    ],
  ],
};
