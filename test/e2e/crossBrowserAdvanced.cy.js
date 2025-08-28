/// <reference types="cypress" />

describe('Cross-Browser Advanced Tests', () => {
  
  const url = 'https://parabank.parasoft.com/parabank/index.htm';

  // ✅ 1. Viewport Adaptation Tests
  const viewports = [
    [1920, 1080], // Full HD
    [1366, 768],  // Common laptop
    [1280, 720]   // Smaller desktop
  ];

  viewports.forEach(([w, h]) => {
    it(`should display correctly at ${w}x${h}`, () => {
      cy.viewport(w, h);
      cy.visit(url);

      // Check UI loads properly at different sizes
      cy.get('h2').should('contain.text', 'Customer Login');
      cy.get('#leftPanel').should('be.visible');
      cy.get('input[name="username"]').should('be.visible');
    });
  });

  // ✅ 2. Performance Timing Collection
  it('collects performance timing metrics', () => {
    cy.visit(url);

    cy.window().then((win) => {
      const perf = win.performance.timing;
      const loadTime = perf.loadEventEnd - perf.navigationStart;
      const domTime = perf.domComplete - perf.domLoading;

      // Log values in Cypress runner
      cy.log(`Page load time: ${loadTime} ms`);
      cy.log(`DOM completion time: ${domTime} ms`);

      // Assert load times are within a reasonable bound
      expect(loadTime).to.be.lessThan(5000); // < 5s
      expect(domTime).to.be.lessThan(5000);  // < 5s
    });
  });

});