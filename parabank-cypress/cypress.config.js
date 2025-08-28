const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    specPattern: 'tests/e2e/**/*.cy.js', // <-- points to your e2e tests
    supportFile: 'tests/support/e2e.js', // optional
    baseUrl: 'https://parabank.parasoft.com', // optional for your app
  },
});