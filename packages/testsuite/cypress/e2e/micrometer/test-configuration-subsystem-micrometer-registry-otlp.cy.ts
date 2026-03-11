describe("TESTS: Configuration => Subsystem => Micrometer => Registry => OTLP", () => {
  const subsystemAddress = ["subsystem", "micrometer"];
  const address = ["subsystem", "micrometer", "registry", "otlp"];
  // HAL generates form IDs with triple-dash separators for child resources,
  // but collapses them to single dashes in some sub-elements (editing div, save button).
  const configurationFormId = "model-browser-model-browser-root---registry---otlp-form";
  const configurationFormIdNoDash = "model-browser-model-browser-root-registry-otlp-form";
  const addWizardFormId = "model-browser-root-registry-singleton-add";

  const endpoint = "endpoint";
  const endpointCustomValue = "http://otel-collector:4318/v1/metrics";
  const endpointExpressionProperty = "micrometer.otlp.endpoint";
  const endpointExpressionPropertyValue = "http://expression-endpoint:4318/v1/metrics";
  const endpointExpressionValue = "${micrometer.otlp.endpoint}";

  const step = "step";
  const stepCustomValue = 30;
  const stepExpressionProperty = "micrometer.otlp.step";
  const stepExpressionPropertyValue = "45";
  const stepExpressionValue = "${micrometer.otlp.step}";

  // Context value for prometheus registry (required field, avoids conflict with metrics subsystem)
  const prometheusContext = "/prometheus";

  let managementEndpoint: string;

  // Workaround for JBEAP-28819 - child resource form IDs use triple-dash separators
  // for the container but single-dash for the editing div.
  function editForm() {
    const editButton = "#" + configurationFormId + ' a.clickable[data-operation="edit"]';
    cy.get(`#${configurationFormIdNoDash}-editing`).should("not.be.visible");
    cy.get(editButton).click();
    for (let reClickTry = 0; reClickTry < 5; reClickTry++) {
      cy.get(editButton).then(($button) => {
        if ($button.is(":visible")) {
          cy.get(editButton).click();
        }
      });
    }
    cy.get(`#${configurationFormIdNoDash}-editing`).should("be.visible");
  }

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
      // The micrometer extension is not part of the base configuration, so it must be added explicitly
      cy.addAddress(managementEndpoint, ["extension", "org.wildfly.extension.micrometer"], {});
      // Register the micrometer subsystem as a parent for the registries
      cy.addAddress(managementEndpoint, subsystemAddress, {});
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

  it("Add otlp registry", () => {
    cy.navigateToGenericSubsystemPage(managementEndpoint, subsystemAddress);
    cy.get("#model-browser-root___registry").should("be.visible").click();
    cy.addInTable("model-browser-children-table");
    // First registry added: wizard shows radio button step, otlp has no required fields
    cy.get("input[type='radio'][value='otlp']").check();
    cy.confirmNextInWizard();
    cy.confirmFinishInWizard();
    cy.verifySuccess();
  });

  it("Add prometheus registry", () => {
    cy.navigateToGenericSubsystemPage(managementEndpoint, subsystemAddress);
    cy.get("#model-browser-root___registry").should("be.visible").click();
    cy.addInTable("model-browser-children-table");
    // Second registry added: wizard skips radio button step, prometheus requires context
    cy.text(addWizardFormId, "context", prometheusContext);
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
  });

  it("Edit endpoint", () => {
    cy.navigateToGenericSubsystemPage(managementEndpoint, subsystemAddress);
    cy.get("#model-browser-root___registry > .jstree-ocl").click();
    cy.get("#model-browser-root___registry___otlp").should("be.visible").click();
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
    editForm();
    cy.text(configurationFormIdNoDash, endpoint, endpointCustomValue);
    cy.saveForm(configurationFormIdNoDash);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, endpoint, endpointCustomValue);
  });

  it("Edit step", () => {
    cy.navigateToGenericSubsystemPage(managementEndpoint, subsystemAddress);
    cy.get("#model-browser-root___registry > .jstree-ocl").click();
    cy.get("#model-browser-root___registry___otlp").should("be.visible").click();
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
    editForm();
    cy.text(configurationFormIdNoDash, step, stepCustomValue.toString());
    cy.saveForm(configurationFormIdNoDash);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, step, stepCustomValue);
  });

  it("Edit endpoint with expression", () => {
    const endpointExpressionSelector = `input#${configurationFormIdNoDash}-${endpoint}-editing.form-control`;
    cy.navigateToGenericSubsystemPage(managementEndpoint, subsystemAddress);
    cy.get("#model-browser-root___registry > .jstree-ocl").click();
    cy.get("#model-browser-root___registry___otlp").should("be.visible").click();
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
    editForm();
    cy.textExpression(configurationFormIdNoDash, endpoint, endpointExpressionValue, {
      selector: endpointExpressionSelector,
    });
    cy.saveForm(configurationFormIdNoDash);
    cy.get(".toast-notifications-list-pf .alert").should("be.visible");
    cy.verifyAttributeAsExpression(managementEndpoint, address, endpoint, endpointExpressionValue);
  });

  it("Edit step with expression", () => {
    const stepExpressionSelector = `input#${configurationFormIdNoDash}-${step}-editing.form-control`;
    cy.navigateToGenericSubsystemPage(managementEndpoint, subsystemAddress);
    cy.get("#model-browser-root___registry > .jstree-ocl").click();
    cy.get("#model-browser-root___registry___otlp").should("be.visible").click();
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
    editForm();
    cy.textExpression(configurationFormIdNoDash, step, stepExpressionValue, {
      selector: stepExpressionSelector,
    });
    cy.saveForm(configurationFormIdNoDash);
    cy.get(".toast-notifications-list-pf .alert").should("be.visible");
    cy.verifyAttributeAsExpression(managementEndpoint, address, step, stepExpressionValue);
  });

  it("Reset configuration", () => {
    cy.navigateToGenericSubsystemPage(managementEndpoint, subsystemAddress);
    cy.get("#model-browser-root___registry > .jstree-ocl").click();
    cy.get("#model-browser-root___registry___otlp").should("be.visible").click();
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
    cy.resetForm(configurationFormId, managementEndpoint, address);
  });
});
