describe("TESTS: Configuration => Subsystem => Undertow => Global settings", () => {
  let managementEndpoint: string;
  const address = ["subsystem", "undertow"];
  const globalSettingsForm = {
    formId: "undertow-global-settings-form",
    defaultSecurityDomain: "default-security-domain",
    defaultServer: "default-server",
    defaultServletContainer: "default-servlet-container",
    defaultVirtualHost: "default-virtual-host",
    instanceId: "instance-id",
    statisticsEnabled: "statistics-enabled",
  };
  const testValues = {
    serverName: "new-server",
    servletContainer: "new-servlet-container",
    serverHost: "new-host-in-new-server",
    instanceId: "new-instaince-id",
    statisticsEnabledExpression: "${wildfly.statistics-enabled:true}",
  };

  before(() => {
    cy.startWildflyContainer()
      .then((result) => {
        managementEndpoint = result as string;
      })
      .then(() => {
        // create fixtures
        cy.task("execute:cli", {
          managementApi: managementEndpoint + "/management",
          address: ["subsystem", "undertow", "server", testValues.serverName],
          operation: "add",
        });
        cy.task("execute:cli", {
          managementApi: managementEndpoint + "/management",
          address: ["subsystem", "undertow", "servlet-container", testValues.servletContainer],
          operation: "add",
        });
        cy.task("execute:cli", {
          managementApi: managementEndpoint + "/management",
          address: ["subsystem", "undertow", "server", testValues.serverName, "host", testValues.serverHost],
          operation: "add",
        });
      });
  });

  after(() => {
    cy.task("stop:containers");
  });

  beforeEach(() => {
    cy.navigateTo(managementEndpoint, "undertow");
    // the form takes a brief moment to initialize
    cy.wait(200);
  });

  it("Should update the default security domain configuration ", () => {
    cy.editForm(globalSettingsForm.formId);
    cy.text(globalSettingsForm.formId, globalSettingsForm.defaultSecurityDomain, "some test value");
    cy.saveForm(globalSettingsForm.formId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, "default-security-domain", "some test value");
  });

  it("Should update the default server configuration", () => {
    cy.editForm(globalSettingsForm.formId);
    cy.text(globalSettingsForm.formId, globalSettingsForm.defaultServer, testValues.serverName);
    cy.saveForm(globalSettingsForm.formId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, "default-server", testValues.serverName);
  });

  it("Should update the default servlet container configuration", () => {
    cy.editForm(globalSettingsForm.formId);
    cy.text(globalSettingsForm.formId, globalSettingsForm.defaultServletContainer, testValues.servletContainer);
    cy.saveForm(globalSettingsForm.formId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, "default-servlet-container", testValues.servletContainer);
  });

  it("Should update the default virtual host configuration", () => {
    cy.editForm(globalSettingsForm.formId);
    cy.text(globalSettingsForm.formId, globalSettingsForm.defaultVirtualHost, testValues.serverHost);
    cy.saveForm(globalSettingsForm.formId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, "default-virtual-host", testValues.serverHost);
  });

  it("Should update the instance ID configuration", () => {
    cy.editForm(globalSettingsForm.formId);
    cy.text(globalSettingsForm.formId, globalSettingsForm.instanceId, testValues.instanceId);
    cy.saveForm(globalSettingsForm.formId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, "instance-id", testValues.instanceId);
  });

  it("Should update the statistics-enabled configuration by changing the expression", () => {
    cy.editForm(globalSettingsForm.formId);
    const expressionFormInputSelector = "input#undertow-global-settings-form-statistics-enabled-editing.form-control";
    cy.textExpression(
      globalSettingsForm.formId,
      globalSettingsForm.statisticsEnabled,
      testValues.statisticsEnabledExpression,
      {
        selector: expressionFormInputSelector,
      }
    );

    cy.saveForm(globalSettingsForm.formId);
    cy.verifySuccess();
    cy.verifyAttributeAsExpression(
      managementEndpoint,
      address,
      "statistics-enabled",
      testValues.statisticsEnabledExpression
    );
  });

  it("Should update the statistics-enabled configuration by flipping the switch", () => {
    cy.editForm(globalSettingsForm.formId);
    cy.get('button[title="Switch to normal mode"]').click();
    cy.flip(globalSettingsForm.formId, "statistics-enabled", false);
    cy.saveForm(globalSettingsForm.formId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, "statistics-enabled", true);
  });
});
