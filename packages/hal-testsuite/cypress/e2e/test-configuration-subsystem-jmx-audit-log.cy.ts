describe("TESTS: Configuration => Subsystem => JMX => Audit Log", () => {
  let managementEndpoint: string;
  const configurationFormId = "jmx-audit-log-form";
  const emptyConfigurationForm = "jmx-audit-log-form-empty";
  const address = ["subsystem", "jmx", "configuration", "audit-log"];
  const enabled = "enabled";

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Create Audit Log", () => {
    cy.removeAddressIfExists(managementEndpoint, address);
    cy.navigateTo(managementEndpoint, "jmx");
    cy.get("#jmx-audit-log-item").click();
    cy.addSingletonResource(emptyConfigurationForm);
    cy.verifySuccess();
    cy.validateAddress(managementEndpoint, address, true);
  });

  it("Toggle enabled", () => {
    let value = false;
    cy.addAddressIfDoesntExist(managementEndpoint, address);
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: address,
      name: enabled,
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "jmx");
      cy.get("#jmx-audit-log-item").click();
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, enabled, value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address, enabled, !value);
    });
  });

  it("Delete Audit Log", () => {
    cy.addAddressIfDoesntExist(managementEndpoint, address);
    cy.navigateTo(managementEndpoint, "jmx");
    cy.get("#jmx-audit-log-item").click();
    cy.removeSingletonResource(configurationFormId);
    cy.verifySuccess();
    cy.validateAddress(managementEndpoint, address, false);
  });

  it("Reset Audit Log", () => {
    cy.addAddressIfDoesntExist(managementEndpoint, address);
    cy.navigateTo(managementEndpoint, "jmx");
    cy.get("#jmx-audit-log-item").click();
    cy.resetForm(configurationFormId, managementEndpoint, address);
  });
});
