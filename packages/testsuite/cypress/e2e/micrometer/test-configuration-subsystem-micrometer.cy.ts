describe("TESTS: Configuration => Subsystem => Micrometer", () => {
  const address = ["subsystem", "micrometer"];
  const configurationFormId = "model-browser-model-browser-root-form";

  const endpointAttr = {
    name: "endpoint",
    customValue: "http://otel-collector:4318/v1/metrics",
    expressionProperty: "micrometer.endpoint",
    expressionPropertyValue: "http://expression-endpoint:4318/v1/metrics",
    expressionValue: "${micrometer.endpoint}",
  };

  const stepAttr = {
    name: "step",
    customValue: 30,
    expressionProperty: "micrometer.step",
    expressionPropertyValue: "45",
    expressionValue: "${micrometer.step}",
  };

  let managementEndpoint: string;

  function navigateToMicrometerPage() {
    cy.navigateToGenericSubsystemPage(managementEndpoint, address);
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
  }

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
      // The micrometer extension is not part of the base configuration, so it must be added explicitly
      cy.addAddress(managementEndpoint, ["extension", "org.wildfly.extension.micrometer"], {});
      // Register the micrometer subsystem so its attributes can be configured and tested
      cy.addAddress(managementEndpoint, address, {});
      // System properties used as expression resolution targets in the expression tests
      cy.addAddress(managementEndpoint, ["system-property", endpointAttr.expressionProperty], {
        value: endpointAttr.expressionPropertyValue,
      });
      cy.addAddress(managementEndpoint, ["system-property", stepAttr.expressionProperty], {
        value: stepAttr.expressionPropertyValue,
      });
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Edit endpoint", () => {
    navigateToMicrometerPage();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, endpointAttr.name, endpointAttr.customValue);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, endpointAttr.name, endpointAttr.customValue);
  });

  it("Edit step", () => {
    navigateToMicrometerPage();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, stepAttr.name, stepAttr.customValue.toString());
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, stepAttr.name, stepAttr.customValue);
  });

  it("Edit endpoint with expression", () => {
    const selector = `input#${configurationFormId}-${endpointAttr.name}-editing.form-control`;
    navigateToMicrometerPage();
    cy.editForm(configurationFormId);
    cy.textExpression(configurationFormId, endpointAttr.name, endpointAttr.expressionValue, { selector });
    cy.saveForm(configurationFormId);
    cy.get(".toast-notifications-list-pf .alert").should("be.visible");
    cy.verifyAttributeAsExpression(managementEndpoint, address, endpointAttr.name, endpointAttr.expressionValue);
  });

  it("Edit step with expression", () => {
    const selector = `input#${configurationFormId}-${stepAttr.name}-editing.form-control`;
    navigateToMicrometerPage();
    cy.editForm(configurationFormId);
    cy.textExpression(configurationFormId, stepAttr.name, stepAttr.expressionValue, { selector });
    cy.saveForm(configurationFormId);
    cy.get(".toast-notifications-list-pf .alert").should("be.visible");
    cy.verifyAttributeAsExpression(managementEndpoint, address, stepAttr.name, stepAttr.expressionValue);
  });

  it("Reset configuration", () => {
    navigateToMicrometerPage();
    cy.get('#model-browser-model-browser-root-form-links > [data-toggle="tooltip"]');
    cy.resetForm(configurationFormId, managementEndpoint, address);
  });
});
