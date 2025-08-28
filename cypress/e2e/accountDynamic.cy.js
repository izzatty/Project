import loginPage from '../pages/loginPage';
import accountPage from '../pages/accountPage';

describe('Dynamic Account Tests', () => {
  beforeEach(() => {
    loginPage.visit();
    loginPage.enterUsername('john');
    loginPage.enterPassword('demo');
    loginPage.clickLogin();
    accountPage.verifyAccountsVisible();
  });

  it('handles multiple accounts dynamically', () => {
    cy.get('#accountTable').find('a').then(accounts => {
      if (accounts.length > 1) {
        cy.wrap(accounts[1]).click(); // click 2nd account if exists
      } else {
        cy.log('Only one account found, skipping multi-account test');
      }
    });
  });
});