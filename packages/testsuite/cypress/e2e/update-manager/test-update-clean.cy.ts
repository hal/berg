describe("TESTS: Update Manager => Updates => Clean", () => {
  let managementEndpoint: string;

  const address = ["update-manager", "updates"];

  before(function () {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
      cy.skipIfNot(cy.isEAP(managementEndpoint), this);
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Clean update cache", () => {
    cy.navigateToUpdateManagerPage(managementEndpoint, address);
    cy.get("#update-manager-clean").click();
    cy.verifySuccess();
  });
});
