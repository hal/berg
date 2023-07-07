// navigation crumbs in the management console
describe("TESTS: Configuration => Sybsystem => Transaction => Path", () => {
  const transactions = "transactions";
  const address = ["subsystem", transactions];
  const pathTab = "#tx-path-config-item";
  const pathForm = "tx-path-form";
  const objectStorePath = "object-store-path";
  const objectStoreRelativeTo = "object-store-relative-to";

  let managementEndpoint: string;

  // Here we start our WildFly container prior to test execution
  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Edit Object Store Path", () => {
    cy.navigateTo(managementEndpoint, transactions);
    cy.get(pathTab).click();
    cy.editForm(pathForm);
    cy.text(pathForm, objectStorePath, "updated-object-store-path");
    cy.saveForm(pathForm);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, objectStorePath, "updated-object-store-path");
  });

  it("Edit Object Store Relative To", () => {
    cy.navigateTo(managementEndpoint, transactions);
    cy.get(pathTab).click();
    cy.editForm(pathForm);
    cy.text(pathForm, objectStoreRelativeTo, "updated-object-store-relative-to");
    cy.saveForm(pathForm);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, objectStoreRelativeTo, "updated-object-store-relative-to");
  });
});
