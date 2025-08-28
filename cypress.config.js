// cypress.config.js
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  reporter: 'mocha-junit-reporter',
  reporterOptions: {
    mochaFile: 'cypress/results/junit-[hash].xml'
  },
  e2e: {
    baseUrl: 'https://parabank.parasoft.com',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    setupNodeEvents(on, config) {
      // place for plugins if/when needed
      return config
    }
  }
})