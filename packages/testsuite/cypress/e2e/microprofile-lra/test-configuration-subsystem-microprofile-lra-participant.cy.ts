describe("TESTS: Configuration => Subsystem => MicroProfile LRA Participant", () => {
  const address = ["subsystem", "microprofile-lra-participant"];
  const configurationFormId = "model-browser-model-browser-root-form";

  const coordinatorUrlAttr = {
    name: "lra-coordinator-url",
    customValue: "http://lra-coordinator:8080/lra-coordinator/lra-coordinator",
    expressionProperty: "lra.participant.coordinator.url",
    expressionPropertyValue: "http://expression-coordinator:8080/lra-coordinator/lra-coordinator",
    expressionValue: "${lra.participant.coordinator.url}",
  };

  const proxyServerAttr = {
    name: "proxy-server",
    customValue: "custom-proxy-server",
    expressionProperty: "lra.participant.proxy.server",
    expressionPropertyValue: "expression-proxy-server",
    expressionValue: "${lra.participant.proxy.server}",
  };

  const proxyHostAttr = {
    name: "proxy-host",
    customValue: "custom-proxy-host",
    expressionProperty: "lra.participant.proxy.host",
    expressionPropertyValue: "expression-proxy-host",
    expressionValue: "${lra.participant.proxy.host}",
  };

  let managementEndpoint: string;

  function navigateToLRAParticipantPage() {
    cy.navigateToGenericSubsystemPage(managementEndpoint, address);
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
  }

  before(function () {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
      cy.skipIf(cy.isEAP(managementEndpoint), this);
      cy.addAddress(managementEndpoint, ["extension", "org.wildfly.extension.microprofile.lra-participant"], {});
      cy.addAddress(managementEndpoint, address, {});
      cy.addAddress(managementEndpoint, ["system-property", coordinatorUrlAttr.expressionProperty], {
        value: coordinatorUrlAttr.expressionPropertyValue,
      });
      cy.addAddress(managementEndpoint, ["system-property", proxyServerAttr.expressionProperty], {
        value: proxyServerAttr.expressionPropertyValue,
      });
      cy.addAddress(managementEndpoint, ["system-property", proxyHostAttr.expressionProperty], {
        value: proxyHostAttr.expressionPropertyValue,
      });
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Edit lra-coordinator-url", () => {
    navigateToLRAParticipantPage();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, coordinatorUrlAttr.name, coordinatorUrlAttr.customValue);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, coordinatorUrlAttr.name, coordinatorUrlAttr.customValue);
  });

  it("Edit proxy-server", () => {
    navigateToLRAParticipantPage();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, proxyServerAttr.name, proxyServerAttr.customValue);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, proxyServerAttr.name, proxyServerAttr.customValue);
  });

  it("Edit proxy-host", () => {
    navigateToLRAParticipantPage();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, proxyHostAttr.name, proxyHostAttr.customValue);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, proxyHostAttr.name, proxyHostAttr.customValue);
  });

  it("Edit lra-coordinator-url with expression", () => {
    const selector = `input#${configurationFormId}-${coordinatorUrlAttr.name}-editing.form-control`;
    navigateToLRAParticipantPage();
    cy.editForm(configurationFormId);
    cy.textExpression(configurationFormId, coordinatorUrlAttr.name, coordinatorUrlAttr.expressionValue, { selector });
    cy.saveForm(configurationFormId);
    cy.get(".toast-notifications-list-pf .alert").should("be.visible");
    cy.verifyAttributeAsExpression(
      managementEndpoint,
      address,
      coordinatorUrlAttr.name,
      coordinatorUrlAttr.expressionValue,
    );
  });

  it("Edit proxy-server with expression", () => {
    const selector = `input#${configurationFormId}-${proxyServerAttr.name}-editing.form-control`;
    navigateToLRAParticipantPage();
    cy.editForm(configurationFormId);
    cy.textExpression(configurationFormId, proxyServerAttr.name, proxyServerAttr.expressionValue, { selector });
    cy.saveForm(configurationFormId);
    cy.get(".toast-notifications-list-pf .alert").should("be.visible");
    cy.verifyAttributeAsExpression(managementEndpoint, address, proxyServerAttr.name, proxyServerAttr.expressionValue);
  });

  it("Edit proxy-host with expression", () => {
    const selector = `input#${configurationFormId}-${proxyHostAttr.name}-editing.form-control`;
    navigateToLRAParticipantPage();
    cy.editForm(configurationFormId);
    cy.textExpression(configurationFormId, proxyHostAttr.name, proxyHostAttr.expressionValue, { selector });
    cy.saveForm(configurationFormId);
    cy.get(".toast-notifications-list-pf .alert").should("be.visible");
    cy.verifyAttributeAsExpression(managementEndpoint, address, proxyHostAttr.name, proxyHostAttr.expressionValue);
  });

  it("Reset configuration", () => {
    navigateToLRAParticipantPage();
    cy.get('#model-browser-model-browser-root-form-links > [data-toggle="tooltip"]');
    cy.resetForm(configurationFormId, managementEndpoint, address);
  });
});
