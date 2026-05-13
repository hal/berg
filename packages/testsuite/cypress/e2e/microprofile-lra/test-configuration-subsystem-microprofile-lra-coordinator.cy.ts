describe("TESTS: Configuration => Subsystem => MicroProfile LRA Coordinator", () => {
  const address = ["subsystem", "microprofile-lra-coordinator"];
  const configurationFormId = "model-browser-model-browser-root-form";

  const serverAttr = {
    name: "server",
    customValue: "custom-server",
    expressionProperty: "lra.coordinator.server",
    expressionPropertyValue: "expression-server",
    expressionValue: "${lra.coordinator.server}",
  };

  const hostAttr = {
    name: "host",
    customValue: "custom-host",
    expressionProperty: "lra.coordinator.host",
    expressionPropertyValue: "expression-host",
    expressionValue: "${lra.coordinator.host}",
  };

  let managementEndpoint: string;

  function navigateToLRACoordinatorPage() {
    cy.navigateToGenericSubsystemPage(managementEndpoint, address);
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
  }

  before(function () {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
      cy.skipIf(cy.isEAP(managementEndpoint), this);
      cy.addAddress(managementEndpoint, ["extension", "org.wildfly.extension.microprofile.lra-coordinator"], {});
      cy.addAddress(managementEndpoint, address, {});
      cy.addAddress(managementEndpoint, ["system-property", serverAttr.expressionProperty], {
        value: serverAttr.expressionPropertyValue,
      });
      cy.addAddress(managementEndpoint, ["system-property", hostAttr.expressionProperty], {
        value: hostAttr.expressionPropertyValue,
      });
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Edit server", () => {
    navigateToLRACoordinatorPage();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, serverAttr.name, serverAttr.customValue);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, serverAttr.name, serverAttr.customValue);
  });

  it("Edit host", () => {
    navigateToLRACoordinatorPage();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, hostAttr.name, hostAttr.customValue);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, hostAttr.name, hostAttr.customValue);
  });

  it("Edit server with expression", () => {
    const selector = `input#${configurationFormId}-${serverAttr.name}-editing.form-control`;
    navigateToLRACoordinatorPage();
    cy.editForm(configurationFormId);
    cy.textExpression(configurationFormId, serverAttr.name, serverAttr.expressionValue, { selector });
    cy.saveForm(configurationFormId);
    cy.get(".toast-notifications-list-pf .alert").should("be.visible");
    cy.verifyAttributeAsExpression(managementEndpoint, address, serverAttr.name, serverAttr.expressionValue);
  });

  it("Edit host with expression", () => {
    const selector = `input#${configurationFormId}-${hostAttr.name}-editing.form-control`;
    navigateToLRACoordinatorPage();
    cy.editForm(configurationFormId);
    cy.textExpression(configurationFormId, hostAttr.name, hostAttr.expressionValue, { selector });
    cy.saveForm(configurationFormId);
    cy.get(".toast-notifications-list-pf .alert").should("be.visible");
    cy.verifyAttributeAsExpression(managementEndpoint, address, hostAttr.name, hostAttr.expressionValue);
  });

  it("Reset configuration", () => {
    navigateToLRACoordinatorPage();
    cy.get('#model-browser-model-browser-root-form-links > [data-toggle="tooltip"]');
    cy.resetForm(configurationFormId, managementEndpoint, address);
  });
});
