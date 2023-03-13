describe("TESTS: Configuration => Subsystem => EJB => Services => Remote", () => {
  let managementEndpoint: string;

  const address = ["subsystem", "ejb3", "service", "remote"];
  const configurationFormId = "ejb3-service-remote-form";

  const connectorToUpdate = "connector-to-update";
  const threadPoolToUpdate = "tp-to-update";

  before(() => {
    cy.startWildflyContainer()
      .then((result) => {
        managementEndpoint = result as string;
      })
      .then(() => {
        cy.addAddress(managementEndpoint, [
          "socket-binding-group",
          "standard-sockets",
          "socket-binding",
          "custom",
        ]);
        cy.addAddress(
          managementEndpoint,
          ["subsystem", "remoting", "connector", connectorToUpdate],
          {
            "socket-binding": "custom",
          }
        );
        cy.addAddress(
          managementEndpoint,
          ["subsystem", "ejb3", "thread-pool", threadPoolToUpdate],
          {
            "max-threads": 10,
          }
        );
      });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Edit connectors", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-service-item").click();
    cy.get("#ejb3-service-remote-item").click();
    cy.editForm(configurationFormId);
    cy.formInput(configurationFormId, "connectors")
      .clear()
      .type(`${connectorToUpdate}{enter}`)
      .trigger("change");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyListAttributeContains(
      managementEndpoint,
      address,
      "connectors",
      connectorToUpdate
    );
  });

  it("Edit thread-pool-name", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-service-item").click();
    cy.get("#ejb3-service-remote-item").click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "thread-pool-name", threadPoolToUpdate);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      address,
      "thread-pool-name",
      threadPoolToUpdate
    );
  });

  it("Toggle execute-in-worker", () => {
    let value = false;
    cy.addAddressIfDoesntExist(managementEndpoint, address);
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: address,
      name: "execute-in-worker",
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "ejb3-configuration");
      cy.get("#ejb3-service-item").click();
      cy.get("#ejb3-service-remote-item").click();
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, "execute-in-worker", value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(
        managementEndpoint,
        address,
        "execute-in-worker",
        !value
      );
    });
  });

  it("Reset", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-service-item").click();
    cy.get("#ejb3-service-remote-item").click();
    cy.resetForm(configurationFormId, managementEndpoint, address);
  });
});
