describe("TESTS: Configuration => Subsystem => Core Management => Configuration Changes", () => {
  let managementEndpoint: string;
  const configurationFormId = "core-mgmt-conf-change-form";
  const emptyConfigurationForm = "core-mgmt-conf-change-form-empty";
  const address = [
    "subsystem",
    "core-management",
    "service",
    "configuration-changes",
  ];
  const maxHistory = "max-history";

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Create Configuration Changes", () => {
    cy.removeAddressIfExists(managementEndpoint, address);
    cy.navigateTo(managementEndpoint, "core-management");
    cy.get("#core-mgmt-conf-change-item").click();
    cy.addSingletonResource(emptyConfigurationForm);
    cy.text("configuration-changes-add", "max-history", "10");
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.validateAddress(managementEndpoint, address, true);
  });

  it("Edit max-history", () => {
    cy.addAddressIfDoesntExist(managementEndpoint, address, {
      "max-history": 10,
    });
    cy.navigateTo(managementEndpoint, "core-management");
    cy.get("#core-mgmt-conf-change-item").click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, maxHistory, "100");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, maxHistory, 100);
  });

  it("Remove Configuration Changes", () => {
    cy.addAddressIfDoesntExist(managementEndpoint, address, {
      "max-history": 10,
    });
    cy.navigateTo(managementEndpoint, "core-management");
    cy.get("#core-mgmt-conf-change-item").click();
    cy.removeSingletonResource(configurationFormId);
    cy.verifySuccess();
    cy.validateAddress(managementEndpoint, address, false);
  });

  it("Reset Configuration Changes", () => {
    cy.addAddressIfDoesntExist(managementEndpoint, address, {
      "max-history": 100,
    });
    cy.navigateTo(managementEndpoint, "core-management");
    cy.get("#core-mgmt-conf-change-item").click();
    cy.resetForm(configurationFormId, managementEndpoint, address);
  });
});
