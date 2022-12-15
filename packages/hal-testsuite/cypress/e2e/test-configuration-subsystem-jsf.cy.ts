describe("TESTS: Configuration => Subsystems => JSF", () => {
  const configurationFormId = "model-browser-model-browser-root-form";
  const address = ["subsystem", "jsf"];
  const disallowDoctypeDecl = "disallow-doctype-decl";

  let managementEndpoint: string;

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Edit default-jsf-impl-slot", () => {
    cy.navigateToGenericSubsystemPage(managementEndpoint, address);
    cy.get(
      '#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]'
    ).click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "default-jsf-impl-slot", "newValue");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      address,
      "default-jsf-impl-slot",
      "newValue"
    );
  });

  it("Toggle disallow-doctype-decl", () => {
    let value: boolean;
    cy.task("execute:cli", {
      managementApi: `${managementEndpoint}/management`,
      operation: "read-attribute",
      address: address,
      name: disallowDoctypeDecl,
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateToGenericSubsystemPage(managementEndpoint, address);
      cy.get(
        '#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]'
      ).click();
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, disallowDoctypeDecl, value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(
        managementEndpoint,
        address,
        disallowDoctypeDecl,
        !value
      );
    });
  });

  it("Reset", () => {
    cy.navigateToGenericSubsystemPage(managementEndpoint, address);
    cy.get(
      '#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]'
    ).click();
    cy.resetForm(
      configurationFormId,
      managementEndpoint + "/management",
      address
    );
  });
});
