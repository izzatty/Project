// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Dismiss unexpected alerts so tests don't break
Cypress.on('window:alert', (msg) => {
  cy.log(`Alert detected: ${msg}`);
  return true; // auto-dismiss
});

Cypress.on('window:confirm', () => true); // auto-accept confirms