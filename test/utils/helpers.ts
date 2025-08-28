/// <reference types="cypress" />

/**
 * Helper functions for Cypress tests
 */

/**
 * Logs in a user via UI
 * @param username - Username for login
 * @param password - Password for login
 */
export function login(username: string, password: string) {
  cy.get('input[name="username"]').type(username);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
}

/**
 * Fills a form with provided data
 * @param formSelector - The CSS selector for the form
 * @param data - Object containing form field names and values
 */
export function fillForm(formSelector: string, data: Record<string, string>) {
  Object.entries(data).forEach(([field, value]) => {
    cy.get(`${formSelector} [name="${field}"]`).type(value);
  });
}

/**
 * Verifies that an element contains expected text
 * @param selector - CSS selector of element
 * @param expectedText - Expected text content
 */
export function checkText(selector: string, expectedText: string) {
  cy.get(selector).should('contain.text', expectedText);
}

/**
 * Example: Wait for an API call to complete
 * @param alias - Alias of the intercepted API
 */
export function waitForApi(alias: string) {
  cy.wait(`@${alias}`);
}