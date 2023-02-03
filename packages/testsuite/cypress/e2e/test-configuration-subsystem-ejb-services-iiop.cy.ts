describe("TESTS: Configuration => Subsystem => EJB => Services => Identity", () => {
  let managementEndpoint: string;

  const address = ["subsystem", "ejb3", "service", "iiop"];
  const configurationFormId = "ejb3-service-iiop-form";

  const emptyForm = "ejb3-service-iiop-form-empty";

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Create IIOP Service", () => {
    cy.removeAddressIfExists(managementEndpoint, address);
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-service-item").click();
    cy.get("#ejb3-service-iiop-item").click();
    cy.addSingletonResource(emptyForm);
    cy.flip(configurationFormId, "enable-by-default", false);
    cy.flip(configurationFormId, "use-qualified-name", false);
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.validateAddress(managementEndpoint, address, true);
  });

  it("Toggle enable-by-default", () => {
    let value = false;
    cy.addAddressIfDoesntExist(managementEndpoint, address);
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: address,
      name: "enable-by-default",
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "ejb3-configuration");
      cy.get("#ejb3-service-item").click();
      cy.get("#ejb3-service-iiop-item").click();
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, "enable-by-default", value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(
        managementEndpoint,
        address,
        "enable-by-default",
        !value
      );
    });
  });

  it("Toggle use-qualified-name", () => {
    let value = false;
    cy.addAddressIfDoesntExist(managementEndpoint, address);
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: address,
      name: "use-qualified-name",
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "ejb3-configuration");
      cy.get("#ejb3-service-item").click();
      cy.get("#ejb3-service-iiop-item").click();
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, "use-qualified-name", value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(
        managementEndpoint,
        address,
        "use-qualified-name",
        !value
      );
    });
  });

  it("Reset", () => {
    cy.addAddressIfDoesntExist(managementEndpoint, address);
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-service-item").click();
    cy.get("#ejb3-service-iiop-item").click();
    cy.resetForm(configurationFormId, managementEndpoint, address);
  });

  it("Remove", () => {
    cy.addAddressIfDoesntExist(managementEndpoint, address);
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-service-item").click();
    cy.get("#ejb3-service-iiop-item").click();
    cy.removeSingletonResource(configurationFormId);
    cy.verifySuccess();
    cy.validateAddress(managementEndpoint, address, false);
  });
});
