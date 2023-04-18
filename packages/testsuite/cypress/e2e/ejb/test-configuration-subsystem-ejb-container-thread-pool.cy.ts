describe("TESTS: Configuration => Subsystem => EJB => Container => Thread Pool", () => {
  let managementEndpoint: string;

  const address = ["subsystem", "ejb3", "thread-pool"];
  const threadPoolTableId = "ejb3-thread-pool-table";
  const configurationFormId = "ejb3-thread-pool-form";
  const threadFactory = "thread-factory-to-udate";

  const threadPools = {
    create: {
      name: "tp-to-create",
    },
    update: {
      name: "tp-to-update",
    },
    remove: {
      name: "tp-to-remove",
    },
    reset: {
      name: "tp-to-reset",
    },
  };

  before(() => {
    cy.startWildflyContainer()
      .then((result) => {
        managementEndpoint = result as string;
      })
      .then(() => {
        cy.addAddress(managementEndpoint, address.concat(threadPools.update.name), {
          "max-threads": 10,
        });
        cy.addAddress(managementEndpoint, address.concat(threadPools.remove.name), {
          "max-threads": 10,
        });
        cy.addAddress(managementEndpoint, address.concat(threadPools.reset.name), {
          "max-threads": 10,
        });
        cy.addAddress(managementEndpoint, ["subsystem", "batch-jberet", "thread-factory", threadFactory]);
      });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Create Thread Pool", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-container-item").click();
    cy.get("#ejb3-thread-pool-item").click();
    cy.addInTable(threadPoolTableId);
    cy.text("ejb3-thread-pool-table-add", "name", threadPools.create.name);
    cy.text("ejb3-thread-pool-table-add", "max-threads", "10");
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.validateAddress(managementEndpoint, address.concat(threadPools.create.name), true);
  });

  it("Edit core-threads", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-container-item").click();
    cy.get("#ejb3-thread-pool-item").click();
    cy.selectInTable(threadPoolTableId, threadPools.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "core-threads", "5");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address.concat(threadPools.update.name), "core-threads", 5);
  });

  it("Edit max-threads", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-container-item").click();
    cy.get("#ejb3-thread-pool-item").click();
    cy.selectInTable(threadPoolTableId, threadPools.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "max-threads", "8");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address.concat(threadPools.update.name), "max-threads", 8);
  });

  it("Edit thread-factory", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-container-item").click();
    cy.get("#ejb3-thread-pool-item").click();
    cy.selectInTable(threadPoolTableId, threadPools.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "thread-factory", threadFactory);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address.concat(threadPools.update.name), "thread-factory", threadFactory);
  });

  it("Remove", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-container-item").click();
    cy.get("#ejb3-thread-pool-item").click();
    cy.removeFromTable(threadPoolTableId, threadPools.remove.name);
    cy.verifySuccess();
    cy.validateAddress(managementEndpoint, address.concat(threadPools.remove.name), false);
  });

  it("Reset", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-container-item").click();
    cy.get("#ejb3-thread-pool-item").click();
    cy.selectInTable(threadPoolTableId, threadPools.reset.name);
    cy.resetForm(configurationFormId, managementEndpoint, address.concat(threadPools.reset.name));
  });
});
