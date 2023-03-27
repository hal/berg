describe("TESTS: Configuration => Subsystem => Health", () => {
  const address = ["subsystem", "health"];
  const configurationFormId = "model-browser-model-browser-root-form";
  const securityEnabled = "security-enabled";

  let managementEndpoint: string;

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Toggle security-enabled", () => {
    let value: boolean;
    cy.task("execute:cli", {
      managementApi: `${managementEndpoint}/management`,
      operation: "read-attribute",
      address: address,
      name: "security-enabled",
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateToGenericSubsystemPage(managementEndpoint, address);
      cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, securityEnabled, value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address, securityEnabled, !value);
    });
  });
});
