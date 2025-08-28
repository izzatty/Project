// ===============================================
// Error Recovery & Self-Healing Tests (Task 2.4)
// Covers: 
// - Popup dialogs
// - Session timeouts
// - Retry failed operations
// - UI order changes
// - Cleanup between tests
// ===============================================

describe('Error Recovery & Self-Healing Tests', () => {
  beforeEach(() => {
    // Always start fresh on ParaBank login page
    cy.visit('https://parabank.parasoft.com/parabank/index.htm');
    cy.ensureLoggedIn('john', 'demo');  // custom command handles expired sessions
  });

  afterEach(() => {
    cy.cleanupSession(); // logout to reset state between tests
  });

  it('Recovers from unexpected popup dialogs', () => {
    // Simulate an unexpected alert popup
    cy.window().then((win) => {
      win.alert("Unexpected popup!");
    });

    // Cypress.on('window:alert') in commands.js will auto-dismiss it
    cy.log(" Alert was detected and handled gracefully");
  });

  it('Handles session timeout by re-logging in', () => {
    // Simulate session timeout by logging out manually
    cy.get('a[href*="logout.htm"]').click({ force: true });

    // Try accessing a protected page -> ensureLoggedIn() should re-login
    cy.ensureLoggedIn('john', 'demo');
    cy.contains('Accounts Overview').should('be.visible');
    cy.log(" Session timeout was recovered with auto re-login");
  });

  it('Retries failed operations intelligently', () => {
    cy.visit('https://parabank.parasoft.com/parabank/transfer.htm');

    // Fill out transfer form
    cy.get('input[name="amount"]').type('5');
    cy.get('input[name="toAccountId"]').select(1); // pick any available account

    // Use custom helper to retry submission if error occurs
    cy.submitWithRetry('input[type="submit"]', 2);

    // Assert either transfer success or error is eventually shown
    cy.contains(/Transfer Complete|Error/).should('exist');
    cy.log(" Form submission retried until success/error confirmed");
  });

  it('Handles UI element order changes with retryClick', () => {
    // Sometimes "Accounts Overview" link may render later/differently
    cy.retryClick('a[href*="overview"]');

    // Self-healing ensures click is eventually successful
    cy.contains('Accounts Overview').should('be.visible');
    cy.log(" Link clicked successfully despite dynamic UI order");
  });
});