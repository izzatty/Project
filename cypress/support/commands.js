// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
// ==== Self-Healing / Error Recovery Helpers ====

// Ensure login, even after unexpected logout / session timeout
Cypress.Commands.add('ensureLoggedIn', (username, password) => {
  cy.get('body').then($body => {
    if ($body.find('a[href*="logout.htm"]').length === 0) {
      cy.log("Session expired or not logged in, logging back in...");
      cy.get('input[name="username"]').clear().type(username);
      cy.get('input[name="password"]').clear().type(password);
      cy.contains('Log In').click();
    } else {
      cy.log("Already logged in");
    }
  });
});

// Retry click if element is detached or hidden
Cypress.Commands.add('retryClick', (selector, retries = 3) => {
  const attempt = (n) => {
    cy.get('body').then($body => {
      if ($body.find(selector).length > 0) {
        cy.get(selector).click({ force: true });
      } else if (n > 0) {
        cy.wait(500);
        attempt(n - 1);
      } else {
        throw new Error(`Element ${selector} not found after retries`);
      }
    });
  };
  attempt(retries);
});

// Handle unexpected popup dialogs
Cypress.on('window:alert', (txt) => {
  cy.log(`Alert detected: ${txt}`);
  // auto-dismiss by default
});

Cypress.on('window:confirm', (txt) => {
  cy.log(`Confirm dialog: ${txt}`);
  return true; // auto-accept
});

// Retry failed operations (example for form submission)
Cypress.Commands.add('submitWithRetry', (selector, retries = 2) => {
  const attempt = (n) => {
    cy.get(selector).click().then(() => {
      cy.get('body').then($body => {
        if ($body.text().includes('Error') && n > 0) {
          cy.log('Retrying form submission...');
          attempt(n - 1);
        }
      });
    });
  };
  attempt(retries);
});

// Cleanup helper (logout to reset state)
Cypress.Commands.add('cleanupSession', () => {
  cy.get('body').then($body => {
    if ($body.find('a[href*="logout.htm"]').length > 0) {
      cy.get('a[href*="logout.htm"]').click({ force: true });
    }
  });
});