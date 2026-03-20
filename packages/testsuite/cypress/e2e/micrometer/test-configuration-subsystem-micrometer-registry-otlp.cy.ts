describe("TESTS: Configuration => Subsystem => Micrometer => Registry => OTLP", () => {
  const subsystemAddress = ["subsystem", "micrometer"];
  const address = ["subsystem", "micrometer", "registry", "otlp"];

  // HAL generates form IDs with triple-dash separators for child resources,
  // but collapses them to single dashes in some sub-elements (editing div, save button).
  const formIds = {
    configuration: "model-browser-model-browser-root---registry---otlp-form",
    configurationNoDash: "model-browser-model-browser-root-registry-otlp-form",
    addWizard: "model-browser-root-registry-singleton-add",
    childrenTable: "model-browser-children-table",
  };

  const treeNodes = {
    registry: "#model-browser-root___registry",
    otlp: "#model-browser-root___registry___otlp",
  };

  const endpointAttr = {
    name: "endpoint",
    customValue: "http://otel-collector:4318/v1/metrics",
    expressionProperty: "micrometer.otlp.endpoint",
    expressionPropertyValue: "http://expression-endpoint:4318/v1/metrics",
    expressionValue: "${micrometer.otlp.endpoint}",
  };

  const stepAttr = {
    name: "step",
    customValue: 30,
    expressionProperty: "micrometer.otlp.step",
    expressionPropertyValue: "45",
    expressionValue: "${micrometer.otlp.step}",
  };

  // Context value for prometheus registry (required field, avoids conflict with metrics subsystem)
  const prometheusContext = "/prometheus";

  let managementEndpoint: string;

  function navigateToOtlpRegistry() {
    cy.navigateToGenericSubsystemPage(managementEndpoint, subsystemAddress);
    cy.get(`${treeNodes.registry} > .jstree-ocl`).click();
    cy.get(treeNodes.otlp).should("be.visible").click();
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
  }

  // Workaround for JBEAP-28819 - child resource form IDs use triple-dash separators
  // for the container but single-dash for the editing div.
  function editForm() {
    const editButton = "#" + formIds.configuration + ' a.clickable[data-operation="edit"]';
    cy.get(`#${formIds.configurationNoDash}-editing`).should("not.be.visible");
    cy.get(editButton).click();
    for (let reClickTry = 0; reClickTry < 5; reClickTry++) {
      cy.get(editButton).then(($button) => {
        if ($button.is(":visible")) {
          cy.get(editButton).click();
        }
      });
    }
    cy.get(`#${formIds.configurationNoDash}-editing`).should("be.visible");
  }

  before(function () {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
      cy.skipIf(cy.isEAP(managementEndpoint), this);
      // The micrometer extension is not part of the base configuration, so it must be added explicitly
      cy.addAddress(managementEndpoint, ["extension", "org.wildfly.extension.micrometer"], {});
      // Register the micrometer subsystem as a parent for the registries
      cy.addAddress(managementEndpoint, subsystemAddress, {});
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

  it("Add otlp registry", () => {
    cy.navigateToGenericSubsystemPage(managementEndpoint, subsystemAddress);
    cy.get(treeNodes.registry).should("be.visible").click();
    cy.get(`#${formIds.childrenTable}_wrapper`).should("be.visible");
    cy.addInTable(formIds.childrenTable);
    // First registry added: wizard shows radio button step, otlp has no required fields
    cy.get("input[type='radio'][value='otlp']").should("exist").check({ force: true });
    cy.get("input[type='radio'][value='otlp']").should("be.checked");
    cy.confirmNextInWizard();
    cy.confirmFinishInWizard();
    cy.verifySuccess();
  });

  it("Add prometheus registry", () => {
    cy.navigateToGenericSubsystemPage(managementEndpoint, subsystemAddress);
    cy.get(treeNodes.registry).should("be.visible").click();
    cy.get(`#${formIds.childrenTable}_wrapper`).should("be.visible");
    cy.addInTable(formIds.childrenTable);
    // Second registry added: wizard skips radio button step, prometheus requires context
    cy.text(formIds.addWizard, "context", prometheusContext);
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
  });

  it("Edit endpoint", () => {
    navigateToOtlpRegistry();
    editForm();
    cy.text(formIds.configurationNoDash, endpointAttr.name, endpointAttr.customValue);
    cy.saveForm(formIds.configurationNoDash);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, endpointAttr.name, endpointAttr.customValue);
  });

  it("Edit step", () => {
    navigateToOtlpRegistry();
    editForm();
    cy.text(formIds.configurationNoDash, stepAttr.name, stepAttr.customValue.toString());
    cy.saveForm(formIds.configurationNoDash);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, stepAttr.name, stepAttr.customValue);
  });

  it("Edit endpoint with expression", () => {
    const selector = `input#${formIds.configurationNoDash}-${endpointAttr.name}-editing.form-control`;
    navigateToOtlpRegistry();
    editForm();
    cy.textExpression(formIds.configurationNoDash, endpointAttr.name, endpointAttr.expressionValue, { selector });
    cy.saveForm(formIds.configurationNoDash);
    cy.get(".toast-notifications-list-pf .alert").should("be.visible");
    cy.verifyAttributeAsExpression(managementEndpoint, address, endpointAttr.name, endpointAttr.expressionValue);
  });

  it("Edit step with expression", () => {
    const selector = `input#${formIds.configurationNoDash}-${stepAttr.name}-editing.form-control`;
    navigateToOtlpRegistry();
    editForm();
    cy.textExpression(formIds.configurationNoDash, stepAttr.name, stepAttr.expressionValue, { selector });
    cy.saveForm(formIds.configurationNoDash);
    cy.get(".toast-notifications-list-pf .alert").should("be.visible");
    cy.verifyAttributeAsExpression(managementEndpoint, address, stepAttr.name, stepAttr.expressionValue);
  });

  it("Reset configuration", () => {
    navigateToOtlpRegistry();
    cy.resetForm(formIds.configuration, managementEndpoint, address);
  });
});
