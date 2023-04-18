describe("TESTS: Configuration => Subsystem => EE => Default Bindings", () => {
  let managementEndpoint: string;

  const address = ["subsystem", "ee", "service", "default-bindings"];
  const configurationFormId = "ee-default-bindings-form";
  const contextService = "context-service";
  const datasource = "datasource";
  const jmsConnectionFactory = "jms-connection-factory";
  const managedExecutorService = "managed-executor-service";
  const managedScheduledExecutorService = "managed-scheduled-executor-service";
  const managedThreadFactory = "managed-thread-factory";

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Edit context-service", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-default-bindings-item").click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, contextService, "cs-to-update");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, contextService, "cs-to-update");
  });

  it("Edit datasource", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-default-bindings-item").click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, datasource, "ds-to-update");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, datasource, "ds-to-update");
  });

  it("Edit jms-connection-factory", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-default-bindings-item").click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, jmsConnectionFactory, "jms-cf-to-update");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, jmsConnectionFactory, "jms-cf-to-update");
  });

  it("Edit managed-executor-service", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-default-bindings-item").click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, managedExecutorService, "mes-to-update");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, managedExecutorService, "mes-to-update");
  });

  it("Edit managed-scheduled-executor-service", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-default-bindings-item").click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, managedScheduledExecutorService, "mses-to-update");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, managedScheduledExecutorService, "mses-to-update");
  });

  it("Edit managed-thread-factory", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-default-bindings-item").click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, managedThreadFactory, "mtf-to-update");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, managedThreadFactory, "mtf-to-update");
  });

  it("Reset", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-default-bindings-item").click();
    cy.resetForm(configurationFormId, managementEndpoint, address);
  });
});
