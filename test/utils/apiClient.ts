/// <reference types="cypress" />

/**
 * Simple API client for Cypress tests (TypeScript version)
 * Handles GET, POST, PUT, DELETE requests
 */

export class ApiClient {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  get(endpoint: string, headers: Record<string, string> = {}) {
    return cy.request({
      method: 'GET',
      url: `${this.baseUrl}${endpoint}`,
      headers,
      failOnStatusCode: false
    });
  }

  post(endpoint: string, body: any = {}, headers: Record<string, string> = {}) {
    return cy.request({
      method: 'POST',
      url: `${this.baseUrl}${endpoint}`,
      body,
      headers,
      failOnStatusCode: false
    });
  }

  put(endpoint: string, body: any = {}, headers: Record<string, string> = {}) {
    return cy.request({
      method: 'PUT',
      url: `${this.baseUrl}${endpoint}`,
      body,
      headers,
      failOnStatusCode: false
    });
  }

  delete(endpoint: string, headers: Record<string, string> = {}) {
    return cy.request({
      method: 'DELETE',
      url: `${this.baseUrl}${endpoint}`,
      headers,
      failOnStatusCode: false
    });
  }
}