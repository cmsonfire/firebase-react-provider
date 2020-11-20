import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import peerDepsExternal from "rollup-plugin-peer-deps-external";

const packageJson = require("./package.json");

export default {
  input: ["src/index.js"],
  output: [
    {
      // file: packageJson.main,
      dir: "dist",
      format: "cjs",
    },
    {
      // file: packageJson.module,
      dir: "dist/esm",
      format: "es",
    },
  ],
  plugins: [
    peerDepsExternal(),
    resolve({
      browser: true,
      resolveOnly: [/^(?!react$)/, /^(?!react-dom$)/, /^(?!prop-types)/],
    }),
    babel({ babelHelpers: "runtime" }),
    commonjs(),
  ],
};
