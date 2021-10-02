module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  roots: ['<rootDir>/src'],
  coverageProvider: "v8",
  coverageDirectory: "coverage",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.ts", "**/*.*spec.ts"],
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(deliverful-types)/)",
  ],
  testTimeout: 20000,
  clearMocks: true
};
