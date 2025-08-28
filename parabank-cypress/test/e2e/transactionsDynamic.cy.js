describe('Dynamic Transactions Table Test with Recovery', () => {
  beforeEach(() => {
    cy.visit('https://parabank.parasoft.com/parabank/index.htm');
    cy.ensureLoggedIn('john', 'demo'); // self-healing login
  });

  it('Handles dynamic transaction tables gracefully', () => {
    // Ensure we’re on Accounts Overview
    cy.retryClick('a[href*="overview"]');
    cy.contains('Accounts Overview').should('be.visible');

    // Select the first account dynamically
    cy.retryClick('a[href*="activity.htm?id="]');

    // Handle dynamic table with recovery
    cy.get('body').then(($body) => {
      if ($body.find('#transactionTable').length > 0) {
        // ✅ Case 1: Transactions exist
        cy.log('Transactions found! Validating table...');

        cy.get('#transactionTable tbody tr')
          .should('have.length.greaterThan', 0);

        cy.get('#transactionTable tbody tr').first().within(() => {
          cy.get('td').eq(0).should('not.be.empty'); // Date
          cy.get('td').eq(1).should('not.be.empty'); // Description
          cy.get('td').eq(2).should('not.be.empty'); // Amount
        });

      } else {
        // ✅ Case 2: No transactions (self-healing fallback)
        cy.log('No transactions found, creating one via transfer...');

        cy.retryClick('a[href*="transfer"]');
        cy.get('input[name="amount"]').type('10');
        cy.get('input[type="submit"]').click();

        // Retry going back to transactions
        cy.retryClick('a[href*="activity.htm?id="]');
        cy.get('#transactionTable tbody tr')
          .should('have.length.greaterThan', 0);
      }
    });
  });
});