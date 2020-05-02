module.exports = {
  preset: "ts-jest",

  // default
  // testEnvironment: "jsdom",

  // jest-electron
  // runner: "jest-electron/runner",
  // testEnvironment: "jest-electron/environment",

  // jest-electron-runner
  // runner: "@jest-runner/electron",
  // testEnvironment: "@jest-runner/electron/environment",

  moduleDirectories: ["node_modules", "<rootDir>"],
  globals: {
    // we must specify a custom tsconfig for tests because we need the typescript transform
    // to transform jsx into js rather than leaving it jsx such as the next build requires.  you
    // can see this setting in tsconfig.jest.json -> "jsx": "react"
    "ts-jest": {
      tsConfig: "tsconfig.test.json",
    },
  },
};
