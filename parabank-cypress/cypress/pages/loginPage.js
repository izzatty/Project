class LoginPage {
  usernameInput = 'input[name="username"]';
  passwordInput = 'input[name="password"]';
  loginButton   = 'input[value="Log In"]';

  visit() {
    cy.visit('https://parabank.parasoft.com/parabank/index.htm');
  }

  enterUsername(username) {
    cy.get(this.usernameInput).clear().type(username);
  }

  enterPassword(password) {
    cy.get(this.passwordInput).clear().type(password);
  }

  clickLogin() {
    cy.get(this.loginButton).click();
  }
}
export default new LoginPage();