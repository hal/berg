describe("TESTS: Configuration => Subsystem => Micrometer", () => {
  const address = ["subsystem", "micrometer"];
  const configurationFormId = "model-browser-model-browser-root-form";

  const endpoint = "endpoint";
  const endpointDefaultValue = "http://localhost:4318/v1/metrics";
  const endpointCustomValue = "http://otel-collector:4318/v1/metrics";
  const endpointExpressionProperty = "micrometer.endpoint";
  const endpointExpressionPropertyValue = "http://expression-endpoint:4318/v1/metrics";
  const endpointExpressionValue = "${micrometer.endpoint}";

  const step = "step";
  const stepDefaultValue = 60;
  const stepCustomValue = 30;
  const stepExpressionProperty = "micrometer.step";
  const stepExpressionPropertyValue = "45";
  const stepExpressionValue = "${micrometer.step}";

  let managementEndpoint: string;

  before(() => {
    cy.task(
      "start:wildfly:container",
      {
        name: Cypress.spec.name.replace(/\.cy\.ts/g, "").replace(/-/g, "_"),
        configuration: "standalone-microprofile-insecure.xml",
        useNetworkHostMode: false,
      },
      { timeout: 240_000 },
    ).then((result) => {
      managementEndpoint = result as string;
      cy.addAddress(managementEndpoint, ["extension", "org.wildfly.extension.micrometer"], {});
      cy.addAddress(managementEndpoint, address, {});
      cy.addAddress(managementEndpoint, ["system-property", endpointExpressionProperty], {
        value: endpointExpressionPropertyValue,
      });
      cy.addAddress(managementEndpoint, ["system-property", stepExpressionProperty], {
        value: stepExpressionPropertyValue,
      });
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Edit endpoint", () => {
    cy.navigateToGenericSubsystemPage(managementEndpoint, address);
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, endpoint, endpointCustomValue);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, endpoint, endpointCustomValue);
  });

  it("Edit step", () => {
    cy.navigateToGenericSubsystemPage(managementEndpoint, address);
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, step, stepCustomValue.toString());
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, step, stepCustomValue);
  });

  it("Edit endpoint with expression", () => {
    const endpointExpressionSelector = `input#${configurationFormId}-${endpoint}-editing.form-control`;
    cy.navigateToGenericSubsystemPage(managementEndpoint, address);
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
    cy.editForm(configurationFormId);
    cy.textExpression(configurationFormId, endpoint, endpointExpressionValue, {
      selector: endpointExpressionSelector,
    });
    cy.saveForm(configurationFormId);
    cy.get(".toast-notifications-list-pf .alert").should("be.visible");
    cy.verifyAttributeAsExpression(managementEndpoint, address, endpoint, endpointExpressionValue);
  });

  it("Edit step with expression", () => {
    const stepExpressionSelector = `input#${configurationFormId}-${step}-editing.form-control`;
    cy.navigateToGenericSubsystemPage(managementEndpoint, address);
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
    cy.editForm(configurationFormId);
    cy.textExpression(configurationFormId, step, stepExpressionValue, {
      selector: stepExpressionSelector,
    });
    cy.saveForm(configurationFormId);
    cy.get(".toast-notifications-list-pf .alert").should("be.visible");
    cy.verifyAttributeAsExpression(managementEndpoint, address, step, stepExpressionValue);
  });

  it("Reset configuration", () => {
    cy.navigateToGenericSubsystemPage(managementEndpoint, address);
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
    cy.get("#model-browser-model-browser-root-form-links > [data-toggle=\"tooltip\"]");
    cy.resetForm(configurationFormId, managementEndpoint, address);
  });
});
