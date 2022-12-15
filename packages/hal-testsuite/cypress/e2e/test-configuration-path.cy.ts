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
    cy.get(
      '#path-table_wrapper button.btn.btn-default > span:contains("Add")'
    ).click();
    cy.text("path-table-add", "name", "newPath");
    cy.text("path-table-add", "path", "somePath");
    cy.get(
      'div.modal-footer > button.btn.btn-hal.btn-primary:contains("Add")'
    ).click();
    cy.verifySuccess();
    cy.validateAddress(managementEndpoint, ["path", "newPath"], true);
  });
});
