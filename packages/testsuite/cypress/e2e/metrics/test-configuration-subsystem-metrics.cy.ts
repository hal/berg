describe("TESTS: Configuration => Subsystem => Metrics", () => {
  const address = ["subsystem", "metrics"];
  const configurationFormId = "model-browser-model-browser-root-form";

  const exposedSubsystems = "exposed-subsystems";
  const exposedSubsystemsForm =
    '[data-form-item-group="model-browser-model-browser-root-form-exposed-subsystems-editing"]';
  const exposedSubsystemsDefaultValue = "*";
  const exposedSubsystemsCustomValue = "subsystems-to-update";
  const prefix = "prefix";
  const customPrefixValue = "wildfly.metrics.prefix:custom_prefix";
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

  it("Edit exposed subsystems", () => {
    cy.navigateToGenericSubsystemPage(managementEndpoint, address);
    cy.editForm(configurationFormId);
    cy.clearListAttributeItems(exposedSubsystemsForm);
    cy.formInput(configurationFormId, exposedSubsystems)
      .clear()
      .type(exposedSubsystemsCustomValue + "{enter}")
      .trigger("change");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyListAttributeContains(managementEndpoint, address, exposedSubsystems, exposedSubsystemsCustomValue);
    cy.verifyListAttributeDoesNotContain(managementEndpoint, address, exposedSubsystems, exposedSubsystemsDefaultValue);
  });

  it("Edit prefix", () => {
    cy.navigateToGenericSubsystemPage(managementEndpoint, address);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, prefix, customPrefixValue);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, prefix, customPrefixValue);
  });

  it("Toggle security-enabled", () => {
    cy.readAttributeAsBoolean(managementEndpoint, address, securityEnabled).then((defaultValue) => {
      cy.navigateToGenericSubsystemPage(managementEndpoint, address);
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, securityEnabled, defaultValue);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address, securityEnabled, !defaultValue);
    });
  });

  it("Reset configuration", () => {
    cy.navigateToGenericSubsystemPage(managementEndpoint, address);
    cy.get('#model-browser-model-browser-root-form-links > [data-toggle="tooltip"]');
    cy.resetForm(configurationFormId, managementEndpoint, address);
  });
});
