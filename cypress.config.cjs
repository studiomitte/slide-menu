const { defineConfig } = require('cypress')

module.exports = defineConfig({
  port: 7000,
  e2e: {
    baseUrl: 'https://google.com',
    supportFile: false,
    testIsolation: false,
  },
})