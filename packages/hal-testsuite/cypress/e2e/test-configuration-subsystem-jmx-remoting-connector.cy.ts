describe("TESTS: Configuration => Subsystem => JMX => Remoting Connector", () => {
  let managementEndpoint: string;
  const configurationFormId = "jmx-remoting-connector-form";
  const address = ["subsystem", "jmx", "remoting-connector", "jmx"];
  const useManagementEndpoint = "use-management-endpoint";

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Toggle use-management-endpoint", () => {
    let value = false;
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: address,
      name: useManagementEndpoint,
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "jmx");
      cy.get("#jmx-remoting-connector-item").click();
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, useManagementEndpoint, value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(
        managementEndpoint,
        address,
        useManagementEndpoint,
        !value
      );
    });
  });

  it("Reset Remoting Connector", () => {
    cy.navigateTo(managementEndpoint, "jmx");
    cy.get("#jmx-remoting-connector-item").click();
    cy.resetForm(
      configurationFormId,
      managementEndpoint + "/management",
      address
    );
  });
});
