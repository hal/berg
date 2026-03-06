describe("TESTS: Configuration => Subsystem => Micrometer => Registry => Prometheus", () => {
  const subsystemAddress = ["subsystem", "micrometer"];
  const address = ["subsystem", "micrometer", "registry", "prometheus"];

  // HAL generates form IDs with triple-dash separators for child resources,
  // but collapses them to single dashes in some sub-elements (editing div, save button).
  const formIds = {
    configuration: "model-browser-model-browser-root---registry---prometheus-form",
    configurationNoDash: "model-browser-model-browser-root-registry-prometheus-form",
    addWizard: "model-browser-root-registry-singleton-add",
    childrenTable: "model-browser-children-table",
  };

  const treeNodes = {
    registry: "#model-browser-root___registry",
    prometheus: "#model-browser-root___registry___prometheus",
  };

  const contextAttr = {
    name: "context",
    // Default context is set to "/prometheus" to avoid a capability conflict with the metrics subsystem.
    // Both serve an HTTP management context, and "/metrics" is already taken by the metrics subsystem.
    defaultValue: "/prometheus",
    customValue: "/prom-custom",
    expressionProperty: "micrometer.prometheus.context",
    expressionPropertyValue: "/prom-expression",
    expressionValue: "${micrometer.prometheus.context}",
  };

  const securityEnabled = "security-enabled";

  let managementEndpoint: string;

  function navigateToPrometheusRegistry() {
    cy.navigateToGenericSubsystemPage(managementEndpoint, subsystemAddress);
    cy.get(`${treeNodes.registry} > .jstree-ocl`).click();
    cy.get(treeNodes.prometheus).should("be.visible").click();
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
      // System property used as expression resolution target in the expression test
      cy.addAddress(managementEndpoint, ["system-property", contextAttr.expressionProperty], {
        value: contextAttr.expressionPropertyValue,
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
    cy.text(formIds.addWizard, contextAttr.name, contextAttr.defaultValue);
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, contextAttr.name, contextAttr.defaultValue);
  });

  it("Edit context", () => {
    navigateToPrometheusRegistry();
    editForm();
    cy.text(formIds.configurationNoDash, contextAttr.name, contextAttr.customValue);
    cy.saveForm(formIds.configurationNoDash);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, contextAttr.name, contextAttr.customValue);
  });

  it("Toggle security-enabled", () => {
    cy.readAttributeAsBoolean(managementEndpoint, address, securityEnabled).then((defaultValue: boolean) => {
      navigateToPrometheusRegistry();
      editForm();
      cy.flip(formIds.configurationNoDash, securityEnabled, defaultValue);
      cy.saveForm(formIds.configurationNoDash);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address, securityEnabled, !defaultValue);
    });
  });

  it("Edit context with expression", () => {
    const selector = `input#${formIds.configurationNoDash}-${contextAttr.name}-editing.form-control`;
    navigateToPrometheusRegistry();
    editForm();
    cy.textExpression(formIds.configurationNoDash, contextAttr.name, contextAttr.expressionValue, { selector });
    cy.saveForm(formIds.configurationNoDash);
    cy.get(".toast-notifications-list-pf .alert").should("be.visible");
    cy.verifyAttributeAsExpression(managementEndpoint, address, contextAttr.name, contextAttr.expressionValue);
  });

  it("Reset configuration", () => {
    navigateToPrometheusRegistry();
    cy.resetForm(formIds.configuration, managementEndpoint, address);
  });
});
