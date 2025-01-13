describe("TESTS: Configuration => Subsystem => Undertow => Global settings", () => {
  let managementEndpoint: string;

  const testValues = {
    serverName: "default-server",
    ajpListener: "test-ajp",
    ajpSocketBindings: "ajp",
    allowedReqAttrsPatternExpression: "${NON-EXISTING:value.*}",
    allowedReqAttrsPatternResolved: "value.*",
  };
  const address = ["subsystem", "undertow", "server", testValues.serverName, "ajp-listener", testValues.ajpListener];
  const serverSelectors = {
    serverListenersItem: "#undertow-server-listener-item",
    ajpListenerItem: "#undertow-server-ajp-listener-item",
  };
  const ajpListenerPageSelectors = {
    ajpListenersTableId: "undertow-server-ajp-listener-table",
  };
  const ajpListenerForm = {
    id: "undertow-server-ajp-listener-form",
    allowedReqAttrsPattern: "allowed-request-attributes-pattern",
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
          address: address,
          operation: "add",
          "socket-binding": testValues.ajpSocketBindings,
        });
      });
  });

  after(() => {
    cy.task("stop:containers");
  });

  beforeEach(() => {
    cy.navigateTo(managementEndpoint, "undertow-server;name=default-server");
    // the form takes a brief moment to initialize
    cy.wait(200);
    cy.get(serverSelectors.serverListenersItem).click();
    cy.get(serverSelectors.ajpListenerItem).click();
  });

  it("Test AJP Listener: allowed request attributes pattern", () => {
    cy.selectInTable(ajpListenerPageSelectors.ajpListenersTableId, testValues.ajpListener);

    cy.editForm(ajpListenerForm.id);
    cy.text(ajpListenerForm.id, ajpListenerForm.allowedReqAttrsPattern, testValues.allowedReqAttrsPatternExpression, {
      parseSpecialCharSequences: false,
    });
    cy.saveForm(ajpListenerForm.id);
    cy.verifySuccess();
    cy.verifyAttributeAsExpression(
      managementEndpoint,
      ["subsystem", "undertow", "server", testValues.serverName, "ajp-listener", testValues.ajpListener],
      ajpListenerForm.allowedReqAttrsPattern,
      testValues.allowedReqAttrsPatternExpression
    );
  });
});
