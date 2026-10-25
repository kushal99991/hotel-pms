import type { Config } from "jest";

const config: Config = {
  maxWorkers: process.env.CI ? "100%" : "50%",
  verbose: false,
  silent: false,
  collectCoverage: false,
  cache: true,
  cacheDirectory: "<rootDir>/jest_cache", // Optional: Custom cache directory
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts", "!**/vendor/**"],
  coverageDirectory: "coverage",
  testEnvironment: "jsdom",
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json", "node"],
  moduleNameMapper: {
    "\\.(css|less|sass|scss)$":
      "<rootDir>/node_modules/jest-css-modules-transform",
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/__mocks__/fileTransformer.js",
    "^components/(.*)$": "<rootDir>/src/components/$1",
    "^constants/(.*)$": "<rootDir>/src/constants/$1",
    "^contexts/(.*)$": "<rootDir>/src/contexts/$1",
    "^pages/(.*)$": "<rootDir>/src/pages/$1",
    "^services/(.*)$": "<rootDir>/src/services/$1",
    "^store/(.*)$": "<rootDir>/src/store/$1",
    "^theme/(.*)$": "<rootDir>/src/theme/$1",
    "^utils/(.*)$": "<rootDir>/src/utils/$1",
    "^types/(.*)$": "<rootDir>/src/types/$1",
    "^routes/(.*)$": "<rootDir>/src/routes/$1",
    "^hooks/(.*)$": "<rootDir>/src/hooks/$1",
    "^styles/(.*)$": "<rootDir>/src/styles/$1",
  },
  transform: {
    "^.+\\.(ts|tsx|js|jsx|mjs|cjs)$": "<rootDir>/swc-jest-transformer.cjs",
  },
  transformIgnorePatterns: [
    "\\.(css|less|sass|scss)$",
    "<rootDir>/node_modules/",
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/coverage",
    "/src/assets/",
    "/src/api/",
    "/src/index.tsx",
    "/src/reportWebVitals.ts",
  ], // Ignore assets in coverage
  testPathIgnorePatterns: [
    "/node_modules/",
    "/src/assets/",
    "/src/api/",
    "/src/index.tsx",
    "/src/reportWebVitals.ts",
    "__tests__/data",
  ], // Skip assets folder during tests
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 80,
    },
  },
  setupFilesAfterEnv: [
    "<rootDir>/jest-setup.ts",
  ],
  testMatch: ["**/__tests__/**/*.test.(ts|tsx)"],
  reporters: [
    "jest-summary-reporter",
    ["default", { "summaryThreshold": 0 }]
  ],
  bail: false,
  errorOnDeprecated: false,
};

export default async (): Promise<Config> => {
  return config;
};
