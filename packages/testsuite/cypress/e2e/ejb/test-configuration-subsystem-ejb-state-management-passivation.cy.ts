describe("TESTS: Configuration => Subsystem => EJB => State Management => Passivation", () => {
  let managementEndpoint: string;

  const address = ["subsystem", "ejb3", "passivation-store"];
  const passivationTableId = "ejb3-passivation-table";
  const configurationFormId = "ejb3-passivation-form";

  const cacheToUpdate = "cache-to-update";

  const cacheContainers = {
    default: {
      name: "cc-default",
      "default-cache": {
        name: "lcc-default",
      },
    },
    update: {
      name: "cc-to-update",
      "default-cache": {
        name: "lcc-to-update",
      },
    },
  };

  const passivations = {
    create: {
      name: "sm-passivation-to-create",
    },
    update: {
      name: "sm-passivation-to-update",
    },
    remove: {
      name: "sm-passivation-to-remove",
    },
    reset: {
      name: "sm-passivation-to-reset",
    },
  };

  before(() => {
    cy.startWildflyContainer()
      .then((result) => {
        managementEndpoint = result as string;
      })
      .then(() => {
        cy.addAddress(
          managementEndpoint,
          ["subsystem", "infinispan", "cache-container", cacheContainers.default.name],
          {
            module: "org.wildfly.clustering.ejb.infinispan",
          }
        );
        cy.addAddress(managementEndpoint, [
          "subsystem",
          "infinispan",
          "cache-container",
          cacheContainers.default.name,
          "local-cache",
          cacheContainers.default["default-cache"].name,
        ]);
        cy.addAddress(managementEndpoint, [
          "subsystem",
          "infinispan",
          "cache-container",
          cacheContainers.default.name,
          "local-cache",
          cacheToUpdate,
        ]);
        cy.task("execute:cli", {
          operation: "write-attribute",
          managementApi: `${managementEndpoint}/management`,
          address: ["subsystem", "infinispan", "cache-container", cacheContainers.default.name],
          name: "default-cache",
          value: cacheContainers.default["default-cache"].name,
        });
        cy.addAddress(managementEndpoint, ["subsystem", "infinispan", "cache-container", cacheContainers.update.name], {
          module: "org.wildfly.clustering.ejb.infinispan",
        });
        cy.addAddress(managementEndpoint, [
          "subsystem",
          "infinispan",
          "cache-container",
          cacheContainers.update.name,
          "local-cache",
          cacheContainers.update["default-cache"].name,
        ]);
        cy.addAddress(managementEndpoint, [
          "subsystem",
          "infinispan",
          "cache-container",
          cacheContainers.update.name,
          "local-cache",
          cacheToUpdate,
        ]);
        cy.task("execute:cli", {
          operation: "write-attribute",
          managementApi: `${managementEndpoint}/management`,
          address: ["subsystem", "infinispan", "cache-container", cacheContainers.update.name],
          name: "default-cache",
          value: cacheContainers.update["default-cache"].name,
        });
        cy.addAddress(managementEndpoint, address.concat(passivations.update.name), {
          "bean-cache": cacheContainers.default["default-cache"].name,
          "cache-container": cacheContainers.default.name,
          "max-size": 1000,
        });
        cy.addAddress(managementEndpoint, address.concat(passivations.remove.name), {
          "bean-cache": cacheContainers.default["default-cache"].name,
          "cache-container": cacheContainers.default.name,
          "max-size": 1000,
        });
        cy.addAddress(managementEndpoint, address.concat(passivations.reset.name), {
          "bean-cache": cacheContainers.default["default-cache"].name,
          "cache-container": cacheContainers.default.name,
          "max-size": 1000,
        });
      });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Create Passivation Store", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-state-item").click();
    cy.get("#ejb3-passivation-item").click();
    cy.addInTable(passivationTableId);
    cy.text("ejb3-passivation-table-add", "name", passivations.create.name);
    cy.text("ejb3-passivation-table-add", "bean-cache", cacheContainers.default["default-cache"].name);
    cy.text("ejb3-passivation-table-add", "bean-cache", cacheContainers.default.name);
    cy.text("ejb3-passivation-table-add", "max-size", "1000");
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.validateAddress(managementEndpoint, address.concat(passivations.create.name), true);
  });

  it("Edit bean-cache", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-state-item").click();
    cy.get("#ejb3-passivation-item").click();
    cy.selectInTable(passivationTableId, passivations.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "bean-cache", cacheToUpdate);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address.concat(passivations.update.name), "bean-cache", cacheToUpdate);
  });

  it("Edit cache-container", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-state-item").click();
    cy.get("#ejb3-passivation-item").click();
    cy.selectInTable(passivationTableId, passivations.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "cache-container", cacheContainers.update.name);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      address.concat(passivations.update.name),
      "cache-container",
      cacheContainers.update.name
    );
  });

  it("Edit max-size", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-state-item").click();
    cy.get("#ejb3-passivation-item").click();
    cy.selectInTable(passivationTableId, passivations.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "max-size", "1234");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address.concat(passivations.update.name), "max-size", 1234);
  });

  it("Remove", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-state-item").click();
    cy.get("#ejb3-passivation-item").click();
    cy.removeFromTable(passivationTableId, passivations.remove.name);
    cy.verifySuccess();
    cy.validateAddress(managementEndpoint, address.concat(passivations.remove.name), false);
  });

  it("Reset", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-state-item").click();
    cy.get("#ejb3-passivation-item").click();
    cy.selectInTable(passivationTableId, passivations.reset.name);
    cy.resetForm(configurationFormId, managementEndpoint, address.concat(passivations.reset.name));
  });
});
