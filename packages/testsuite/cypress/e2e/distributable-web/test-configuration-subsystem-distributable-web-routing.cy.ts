describe("TESTS: Configuration => Subsystem => Distributable Web => Routing", () => {
  let managementEndpoint: string;

  const cacheToUpdate = "cache-to-update";
  const configurationFormId = "dw-routing-infinispan-form";

  const cacheContainers = {
    create: {
      name: "cc-to-add",
      "default-cache": {
        name: "lcc-to-add",
      },
    },
    update: {
      name: "cc-to-update",
      "default-cache": {
        name: "lcc-to-update",
      },
    },
  };

  before(() => {
    cy.startWildflyContainer()
      .then((result) => {
        managementEndpoint = result as string;
      })
      .then(() => {
        cy.addAddress(managementEndpoint, ["subsystem", "infinispan", "cache-container", cacheContainers.create.name], {
          module: "org.wildfly.clustering.ejb.infinispan",
        });
        cy.addAddress(managementEndpoint, [
          "subsystem",
          "infinispan",
          "cache-container",
          cacheContainers.create.name,
          "local-cache",
          cacheContainers.create["default-cache"].name,
        ]);
        cy.addAddress(managementEndpoint, [
          "subsystem",
          "infinispan",
          "cache-container",
          cacheContainers.create.name,
          "local-cache",
          cacheToUpdate,
        ]);
        cy.task("execute:cli", {
          operation: "write-attribute",
          managementApi: `${managementEndpoint}/management`,
          address: ["subsystem", "infinispan", "cache-container", cacheContainers.create.name],
          name: "default-cache",
          value: cacheContainers.create["default-cache"].name,
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
      });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Switch routing to Infinispan", () => {
    cy.navigateTo(managementEndpoint, "distributable-web");
    cy.get("#dw-routing-item").click();
    cy.get("#dw-routing-select").select("Infinispan", { force: true });
    cy.text("dw-routing-infinispan-add", "cache-container", cacheContainers.create.name);
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.validateAddress(managementEndpoint, ["subsystem", "distributable-web", "routing", "infinispan"], true);
  });

  it("Edit cache", () => {
    cy.addAddress(managementEndpoint, ["subsystem", "distributable-web", "routing", "infinispan"], {
      "cache-container": cacheContainers.create.name,
    });
    cy.navigateTo(managementEndpoint, "distributable-web");
    cy.get("#dw-routing-item").click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "cache", cacheToUpdate);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      ["subsystem", "distributable-web", "routing", "infinispan"],
      "cache",
      cacheToUpdate
    );
  });

  it("Edit cache-container", () => {
    cy.addAddress(managementEndpoint, ["subsystem", "distributable-web", "routing", "infinispan"], {
      "cache-container": cacheContainers.create.name,
    });
    cy.navigateTo(managementEndpoint, "distributable-web");
    cy.get("#dw-routing-item").click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "cache-container", cacheContainers.update.name);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      ["subsystem", "distributable-web", "routing", "infinispan"],
      "cache-container",
      cacheContainers.update.name
    );
  });

  it("Reset", () => {
    cy.addAddress(managementEndpoint, ["subsystem", "distributable-web", "routing", "infinispan"], {
      "cache-container": cacheContainers.create.name,
    });
    cy.navigateTo(managementEndpoint, "distributable-web");
    cy.get("#dw-routing-item").click();
    cy.resetForm(configurationFormId, managementEndpoint, ["subsystem", "distributable-web", "routing", "infinispan"]);
  });

  it("Switch routing to local", () => {
    cy.addAddress(managementEndpoint, ["subsystem", "distributable-web", "routing", "infinispan"], {
      "cache-container": cacheContainers.create.name,
    });
    cy.navigateTo(managementEndpoint, "distributable-web");
    cy.get("#dw-routing-item").click();
    cy.get("#dw-routing-select").select("local", { force: true });
    cy.verifySuccess();
    cy.validateAddress(managementEndpoint, ["subsystem", "distributable-web", "routing", "local"], true);
  });
});
