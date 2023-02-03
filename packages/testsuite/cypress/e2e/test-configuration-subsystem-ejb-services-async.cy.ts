describe("TESTS: Configuration => Subsystem => EJB => Services => Async", () => {
  let managementEndpoint: string;

  const address = ["subsystem", "ejb3", "service", "async"];
  const configurationFormId = "ejb3-service-async-form";

  const threadPoolToUpdate = "tp-to-update";

  before(() => {
    cy.startWildflyContainer()
      .then((result) => {
        managementEndpoint = result as string;
      })
      .then(() => {
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

  it("Edit thread-pool-name", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-service-item").click();
    cy.get("#ejb3-service-async-item").click();
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

  it("Reset", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-service-item").click();
    cy.get("#ejb3-service-async-item").click();
    cy.resetForm(configurationFormId, managementEndpoint, address);
  });
});
