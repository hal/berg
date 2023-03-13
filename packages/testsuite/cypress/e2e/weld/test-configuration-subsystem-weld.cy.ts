describe("TESTS: Configuration => Subsystems => Weld", () => {
  const configurationFormId = "model-browser-model-browser-root-form";
  const address = ["subsystem", "weld"];
  const developmentMode = "development-mode";
  const nonPortableMode = "non-portable-mode";
  const requireBeanDescriptor = "require-bean-descriptor";
  const threadPoolSize = "thread-pool-size";

  let managementEndpoint: string;

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Toggle development-mode", () => {
    let value: boolean;
    cy.task("execute:cli", {
      managementApi: `${managementEndpoint}/management`,
      operation: "read-attribute",
      address: address,
      name: developmentMode,
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateToGenericSubsystemPage(managementEndpoint, address);
      cy.get(
        '#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]'
      ).click();
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, developmentMode, value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address, developmentMode, !value);
    });
  });

  it("Toggle non-portable-mode", () => {
    let value: boolean;
    cy.task("execute:cli", {
      managementApi: `${managementEndpoint}/management`,
      operation: "read-attribute",
      address: address,
      name: nonPortableMode,
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateToGenericSubsystemPage(managementEndpoint, address);
      cy.get(
        '#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]'
      ).click();
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, nonPortableMode, value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address, nonPortableMode, !value);
    });
  });

  it("Toggle require-bean-descriptor", () => {
    let value: boolean;
    cy.task("execute:cli", {
      managementApi: `${managementEndpoint}/management`,
      operation: "read-attribute",
      address: address,
      name: requireBeanDescriptor,
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateToGenericSubsystemPage(managementEndpoint, address);
      cy.get(
        '#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]'
      ).click();
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, requireBeanDescriptor, value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(
        managementEndpoint,
        address,
        requireBeanDescriptor,
        !value
      );
    });
  });

  it("Edit thread-pool-size", () => {
    cy.navigateToGenericSubsystemPage(managementEndpoint, address);
    cy.get(
      '#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]'
    ).click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, threadPoolSize, "2");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, threadPoolSize, 2);
  });

  it("Reset", () => {
    cy.navigateToGenericSubsystemPage(managementEndpoint, address);
    cy.get(
      '#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]'
    ).click();
    cy.resetForm(configurationFormId, managementEndpoint, address);
  });
});
