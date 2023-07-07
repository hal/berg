describe("TESTS: Configuration => Sybsystem => Transaction", () => {
  let managementEndpoint: string;

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Get to Transaction Subsystem from homepage", () => {
    cy.visit(`?connect=${managementEndpoint}`);
    cy.get("#tlc-configuration").click();
    cy.get("#subsystems").click();
    cy.get("#transactions").click();
    cy.get("#transactions").find(".btn").click();
    cy.url().should("include", "transactions");
  });
});
