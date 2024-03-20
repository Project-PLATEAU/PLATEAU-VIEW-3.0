module.exports = {
  extends: ["reearth/common", "reearth/node", "reearth/typescript"],
  env: {
    node: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
  },
};
