describe("TESTS: Configuration => Subsystem => EJB => State Management => Cache", () => {
  let managementEndpoint: string;

  const address = ["subsystem", "ejb3", "cache"];
  const cacheTableId = "ejb3-cache-table";
  const configurationFormId = "ejb3-cache-form";

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
    update: {
      name: "sm-passivation-to-update",
    },
  };

  const caches = {
    create: {
      name: "cache-to-create",
    },
    update: {
      name: "cache-to-update",
    },
    remove: {
      name: "cache-to-remove",
    },
    reset: {
      name: "cache-to-reset",
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
        cy.task("execute:cli", {
          operation: "write-attribute",
          managementApi: `${managementEndpoint}/management`,
          address: ["subsystem", "infinispan", "cache-container", cacheContainers.default.name],
          name: "default-cache",
          value: cacheContainers.default["default-cache"].name,
        });
        cy.addAddress(managementEndpoint, ["subsystem", "ejb3", "passivation-store", passivations.update.name], {
          "bean-cache": cacheContainers.default["default-cache"].name,
          "cache-container": cacheContainers.default.name,
          "max-size": 1000,
        });
        cy.addAddress(managementEndpoint, address.concat(caches.remove.name));
        cy.addAddress(managementEndpoint, address.concat(caches.reset.name));
        cy.addAddress(managementEndpoint, address.concat(caches.update.name));
      });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Create Cache", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-state-item").click();
    cy.get("#ejb3-cache-item").click();
    cy.addInTable(cacheTableId);
    cy.text("ejb3-cache-table-add", "name", caches.create.name);
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.validateAddress(managementEndpoint, address.concat(caches.create.name), true);
  });

  it("Edit aliases", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-state-item").click();
    cy.get("#ejb3-cache-item").click();
    cy.selectInTable(cacheTableId, caches.update.name);
    cy.editForm(configurationFormId);
    cy.formInput(configurationFormId, "aliases").clear().type("another-alias{enter}").trigger("change");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyListAttributeContains(managementEndpoint, address.concat(caches.update.name), "aliases", "another-alias");
  });

  it("Edit passivation-store", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-state-item").click();
    cy.get("#ejb3-cache-item").click();
    cy.selectInTable(cacheTableId, caches.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "passivation-store", passivations.update.name);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      address.concat(caches.update.name),
      "passivation-store",
      passivations.update.name
    );
  });

  it("Remove", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-state-item").click();
    cy.get("#ejb3-cache-item").click();
    cy.removeFromTable(cacheTableId, caches.remove.name);
    cy.verifySuccess();
    cy.validateAddress(managementEndpoint, address.concat(caches.remove.name), false);
  });

  it("Reset", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-state-item").click();
    cy.get("#ejb3-cache-item").click();
    cy.selectInTable(cacheTableId, caches.reset.name);
    cy.resetForm(configurationFormId, managementEndpoint, address.concat(caches.reset.name));
  });
});
