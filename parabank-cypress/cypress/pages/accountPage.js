class AccountPage {
  accountTable = '#accountTable';

  verifyAccountsVisible() {
    cy.get(this.accountTable, { timeout: 10000 }).should('be.visible');
  }

  clickFirstAccount() {
    cy.get(this.accountTable).find('a').first().click();
  }

  clickAccountByIndex(index) {
    cy.get(this.accountTable).find('a').eq(index).click();
  }
}
export default new AccountPage();