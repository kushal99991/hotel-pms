const { createTransformer } = require("@swc/jest");

const swcTransformer = createTransformer({
  jsc: {
    parser: {
      syntax: "typescript",
      tsx: true,
    },
    transform: {
      react: {
        runtime: "automatic",
      },
    },
  },
  module: {
    type: "commonjs",
    importInterop: "swc",
  },
});

module.exports = {
  process(src, filename, config, transformOptions) {
    // Replace import.meta.env with process.env before SWC processes it
    const modified = src.replace(/import\.meta\.env/g, "process.env");
    return swcTransformer.process(modified, filename, config, transformOptions);
  },
};
