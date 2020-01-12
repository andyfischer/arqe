
module.exports = {
  clearMocks: true,
  "transform": {
      "^.+\\.tsx?$": "ts-jest"
  },
  "testMatch": [
      "**/src/grind-test/*.test.(js|ts)"
  ],
  "moduleFileExtensions": [
      "ts",
      "tsx",
      "js",
      "jsx"
  ]
};
