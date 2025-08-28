describe('Data-Driven Login Tests with Self-Healing', () => {
  beforeEach(() => {
    cy.visit('https://parabank.parasoft.com/parabank/index.htm');
  });

  it('Validates different user logins with recovery', () => {
    cy.fixture('users').then((users) => {
      users.forEach((user) => {
        cy.log(`Testing: ${user.description}`);

        // Use self-healing login
        cy.ensureLoggedIn(user.username, user.password);

        if (user.type === 'negative') {
          // Expect error for invalid login
          cy.contains('Error!').should('be.visible');
        } else {
          // Expect successful login for valid users
          cy.retryClick('a[href*="overview"]');
          cy.contains('Accounts Overview').should('be.visible');

          // logout for next user (with retry in case logout is delayed)
          cy.retryClick('a[href*="logout.htm"]');
        }
      });
    });
  });
});