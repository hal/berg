describe("TESTS: Smoke", () => {
  it("Contains management interfaces table", () => {
    cy.visit("");
    cy.get("#hal-modal").should("be.visible");
    cy.get("#endpoint-select_wrapper").should("be.visible");
    cy.get('button.btn.btn-default[aria-controls="endpoint-select"] span:contains("Add")').should("be.visible");
  });
});
