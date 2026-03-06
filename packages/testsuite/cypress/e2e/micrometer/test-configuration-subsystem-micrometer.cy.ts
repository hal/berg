describe("TESTS: Configuration => Subsystem => Micrometer", () => {
  const address = ["subsystem", "micrometer"];
  const configurationFormId = "model-browser-model-browser-root-form";

  const endpoint = "endpoint";
  const endpointCustomValue = "http://otel-collector:4318/v1/metrics";
  const endpointExpressionProperty = "micrometer.endpoint";
  const endpointExpressionPropertyValue = "http://expression-endpoint:4318/v1/metrics";
  const endpointExpressionValue = "${micrometer.endpoint}";

  const step = "step";
  const stepCustomValue = 30;
  const stepExpressionProperty = "micrometer.step";
  const stepExpressionPropertyValue = "45";
  const stepExpressionValue = "${micrometer.step}";

  let managementEndpoint: string;

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
      // The micrometer extension is not part of the base configuration, so it must be added explicitly
      cy.addAddress(managementEndpoint, ["extension", "org.wildfly.extension.micrometer"], {});
      // Register the micrometer subsystem so its attributes can be configured and tested
      cy.addAddress(managementEndpoint, address, {});
      // System properties used as expression resolution targets in the expression tests
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

  // Verify that top-level otlp-registry attributes are aliases to the registry=otlp sub-resource.
  // Writing endpoint at the subsystem root should be reflected in registry=otlp.
  it("Verify endpoint is aliased to registry=otlp", () => {
    cy.verifyAttribute(
      managementEndpoint,
      ["subsystem", "micrometer", "registry", "otlp"],
      endpoint,
      endpointCustomValue,
    );
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
    cy.get('#model-browser-model-browser-root-form-links > [data-toggle="tooltip"]');
    cy.resetForm(configurationFormId, managementEndpoint, address);
  });
});
