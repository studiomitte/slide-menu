const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://google.com',
    supportFile: './cypress/support/e2e.js',
    testIsolation: false,
  },
})