describe("TESTS: Configuration => Paths", () => {
  let managementEndpoint: string;

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
    });
  });

  beforeEach(() => {
    cy.navigateTo(managementEndpoint, "path");
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Create Path", () => {
    cy.addInTable("path-table");
    cy.text("path-table-add", "name", "newPath");
    cy.text("path-table-add", "path", "somePath");
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.validateAddress(managementEndpoint, ["path", "newPath"], true);
  });
});
