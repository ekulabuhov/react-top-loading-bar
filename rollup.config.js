import babel from "rollup-plugin-babel";
import postcss from "rollup-plugin-postcss";

export default {
  input: "LoadingBar.js",
  output: {
    file: "bundle.js",
    format: "cjs"
  },
  plugins: [
    postcss({
      extensions: [".css"]
    }),
    babel({
      exclude: "node_modules/**" // only transpile our source code
    })
  ]
};
