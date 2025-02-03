const { defineConfig } = require('cypress')
const { pa11y, prepareAudit } = require("@cypress-audit/pa11y");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://google.com',
    supportFile: './cypress/support/e2e.js',
    testIsolation: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on("before:browser:launch", (browser = {}, launchOptions) => {
        prepareAudit(launchOptions);
      });

      on("task", {
        pa11y: pa11y(),
      });
    },
  },
});

