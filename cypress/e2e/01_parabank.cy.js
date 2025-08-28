describe('ParaBank smoke', () => {
  it('visits homepage and checks title', () => {
    cy.visit('/')
    cy.contains('ParaBank')  // simple check — adjust if text differs
  })
})