/* eslint-disable @typescript-eslint/no-require-imports */
const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/agent-skills/"],
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/lib/supabase/client$": "<rootDir>/src/__mocks__/supabase-client.ts",
  },
};
