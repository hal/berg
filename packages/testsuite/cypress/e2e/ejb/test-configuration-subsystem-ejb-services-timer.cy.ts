describe("TESTS: Configuration => Subsystem => EJB => Services => Timer", () => {
  let managementEndpoint: string;

  const address = ["subsystem", "ejb3", "service", "timer-service"];
  const configurationFormId = "ejb3-service-timer-form";

  const threadPoolToUpdate = "tp-to-update";
  const fileDataStoreToUpdate = {
    name: "file-data-store-to-update",
    path: "temp-data-store-path",
  };

  before(() => {
    cy.startWildflyContainer()
      .then((result) => {
        managementEndpoint = result as string;
      })
      .then(() => {
        cy.addAddress(managementEndpoint, address.concat("file-data-store", fileDataStoreToUpdate.name), {
          path: fileDataStoreToUpdate.path,
        });
        cy.addAddress(managementEndpoint, ["subsystem", "ejb3", "thread-pool", threadPoolToUpdate], {
          "max-threads": 10,
        });
      });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Edit default-data-store", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-service-item").click();
    cy.get("#ejb3-service-timer-item").click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "default-data-store", fileDataStoreToUpdate.name);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, "default-data-store", fileDataStoreToUpdate.name);
  });

  it("Edit default-persistent-timer-management", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-service-item").click();
    cy.get("#ejb3-service-timer-item").click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "default-persistent-timer-management", "transient");
    cy.clearAttribute(configurationFormId, "default-data-store");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, "default-persistent-timer-management", "transient");
  });

  it("Edit thread-pool-name", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-service-item").click();
    cy.get("#ejb3-service-timer-item").click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "thread-pool-name", threadPoolToUpdate);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, "thread-pool-name", threadPoolToUpdate);
  });

  it("Edit default-transient-timer-management", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-service-item").click();
    cy.get("#ejb3-service-timer-item").click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "default-transient-timer-management", "transient");
    cy.clearAttribute(configurationFormId, "thread-pool-name");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, "default-transient-timer-management", "transient");
  });
});
