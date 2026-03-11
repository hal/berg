describe("TESTS: Configuration => Subsystem => Micrometer => Registry => Prometheus", () => {
  const subsystemAddress = ["subsystem", "micrometer"];
  const address = ["subsystem", "micrometer", "registry", "prometheus"];
  // HAL generates form IDs with triple-dash separators for child resources,
  // but collapses them to single dashes in some sub-elements (editing div, save button).
  const configurationFormId = "model-browser-model-browser-root---registry---prometheus-form";
  const configurationFormIdNoDash = "model-browser-model-browser-root-registry-prometheus-form";
  const addWizardFormId = "model-browser-root-registry-singleton-add";

  const context = "context";
  // Default context is set to "/prometheus" to avoid a capability conflict with the metrics subsystem.
  // Both serve an HTTP management context, and "/metrics" is already taken by the metrics subsystem.
  const contextDefaultValue = "/prometheus";
  const contextCustomValue = "/prom-custom";
  const contextExpressionProperty = "micrometer.prometheus.context";
  const contextExpressionPropertyValue = "/prom-expression";
  const contextExpressionValue = "${micrometer.prometheus.context}";

  const securityEnabled = "security-enabled";

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
      // System property used as expression resolution target in the expression test
      cy.addAddress(managementEndpoint, ["system-property", contextExpressionProperty], {
        value: contextExpressionPropertyValue,
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
    cy.text(addWizardFormId, context, contextDefaultValue);
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, context, contextDefaultValue);
  });

  it("Edit context", () => {
    cy.navigateToGenericSubsystemPage(managementEndpoint, subsystemAddress);
    cy.get("#model-browser-root___registry > .jstree-ocl").click();
    cy.get("#model-browser-root___registry___prometheus").should("be.visible").click();
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
    editForm();
    cy.text(configurationFormIdNoDash, context, contextCustomValue);
    cy.saveForm(configurationFormIdNoDash);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, context, contextCustomValue);
  });

  it("Toggle security-enabled", () => {
    cy.readAttributeAsBoolean(managementEndpoint, address, securityEnabled).then((defaultValue: boolean) => {
      cy.navigateToGenericSubsystemPage(managementEndpoint, subsystemAddress);
      cy.get("#model-browser-root___registry > .jstree-ocl").click();
      cy.get("#model-browser-root___registry___prometheus").should("be.visible").click();
      cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
      editForm();
      cy.flip(configurationFormIdNoDash, securityEnabled, defaultValue);
      cy.saveForm(configurationFormIdNoDash);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address, securityEnabled, !defaultValue);
    });
  });

  it("Edit context with expression", () => {
    const contextExpressionSelector = `input#${configurationFormIdNoDash}-${context}-editing.form-control`;
    cy.navigateToGenericSubsystemPage(managementEndpoint, subsystemAddress);
    cy.get("#model-browser-root___registry > .jstree-ocl").click();
    cy.get("#model-browser-root___registry___prometheus").should("be.visible").click();
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
    editForm();
    cy.textExpression(configurationFormIdNoDash, context, contextExpressionValue, {
      selector: contextExpressionSelector,
    });
    cy.saveForm(configurationFormIdNoDash);
    cy.get(".toast-notifications-list-pf .alert").should("be.visible");
    cy.verifyAttributeAsExpression(managementEndpoint, address, context, contextExpressionValue);
  });

  it("Reset configuration", () => {
    cy.navigateToGenericSubsystemPage(managementEndpoint, subsystemAddress);
    cy.get("#model-browser-root___registry > .jstree-ocl").click();
    cy.get("#model-browser-root___registry___prometheus").should("be.visible").click();
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
    cy.resetForm(configurationFormId, managementEndpoint, address);
  });
});
