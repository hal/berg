describe("TESTS: Configuration => Subsystem => Distributable Web => Infinispan Session", () => {
  let managementEndpoint: string;

  const configurationFormId = "dw-infinispan-session-management-form";
  const infinispanSessionManagementTableId = "dw-infinispan-session-management-table";
  const granularity = "granularity";

  const cacheToUpdate = "cache-to-update";

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

  const infinispanSessionManagements = {
    create: {
      name: "ism-to-add",
      "cache-container": cacheContainers.create.name,
    },
    update: {
      name: "ism-to-update",
      "cache-container": cacheContainers.create.name,
    },
    delete: {
      name: "ism-to-delete",
      "cache-container": cacheContainers.create.name,
    },
    reset: {
      name: "ism-to-reset",
      "cache-container": cacheContainers.create.name,
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
        cy.task("execute:cli", {
          operation: "composite",
          managementApi: `${managementEndpoint}/management`,
          steps: [
            {
              operation: "add",
              address: [
                "subsystem",
                "distributable-web",
                "infinispan-session-management",
                infinispanSessionManagements.update.name,
              ],
              "cache-container": infinispanSessionManagements.update["cache-container"],
              granularity: "SESSION",
            },
            {
              operation: "add",
              address: [
                "subsystem",
                "distributable-web",
                "infinispan-session-management",
                infinispanSessionManagements.update.name,
                "affinity",
                "local",
              ],
            },
          ],
        });
        cy.task("execute:cli", {
          operation: "composite",
          managementApi: `${managementEndpoint}/management`,
          steps: [
            {
              operation: "add",
              address: [
                "subsystem",
                "distributable-web",
                "infinispan-session-management",
                infinispanSessionManagements.delete.name,
              ],
              "cache-container": infinispanSessionManagements.delete["cache-container"],
              granularity: "SESSION",
            },
            {
              operation: "add",
              address: [
                "subsystem",
                "distributable-web",
                "infinispan-session-management",
                infinispanSessionManagements.delete.name,
                "affinity",
                "local",
              ],
            },
          ],
        });
        cy.task("execute:cli", {
          operation: "composite",
          managementApi: `${managementEndpoint}/management`,
          steps: [
            {
              operation: "add",
              address: [
                "subsystem",
                "distributable-web",
                "infinispan-session-management",
                infinispanSessionManagements.reset.name,
              ],
              "cache-container": infinispanSessionManagements.reset["cache-container"],
              granularity: "SESSION",
            },
            {
              operation: "add",
              address: [
                "subsystem",
                "distributable-web",
                "infinispan-session-management",
                infinispanSessionManagements.reset.name,
                "affinity",
                "local",
              ],
            },
          ],
        });
      });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Create Infinispan Session Management", () => {
    cy.navigateTo(managementEndpoint, "distributable-web");
    cy.get("#dw-infinispan-session-management-item").click();
    cy.addInTable(infinispanSessionManagementTableId);
    cy.text("dw-infinispan-session-management-table-add", "name", infinispanSessionManagements.create.name);
    cy.text(
      "dw-infinispan-session-management-table-add",
      "cache-container",
      infinispanSessionManagements.create["cache-container"]
    );
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.validateAddress(
      managementEndpoint,
      ["subsystem", "distributable-web", "infinispan-session-management", infinispanSessionManagements.create.name],
      true
    );
  });

  it("Edit cache", () => {
    cy.navigateTo(managementEndpoint, "distributable-web");
    cy.get("#dw-infinispan-session-management-item").click();
    cy.selectInTable(infinispanSessionManagementTableId, infinispanSessionManagements.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "cache", cacheToUpdate);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      ["subsystem", "distributable-web", "infinispan-session-management", infinispanSessionManagements.update.name],
      "cache",
      cacheToUpdate
    );
  });

  it("Edit cache-container", () => {
    cy.navigateTo(managementEndpoint, "distributable-web");
    cy.get("#dw-infinispan-session-management-item").click();
    cy.selectInTable(infinispanSessionManagementTableId, infinispanSessionManagements.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "cache-container", cacheContainers.update.name);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      ["subsystem", "distributable-web", "infinispan-session-management", infinispanSessionManagements.update.name],
      "cache-container",
      cacheContainers.update.name
    );
  });

  it("Edit granularity", () => {
    cy.navigateTo(managementEndpoint, "distributable-web");
    cy.get("#dw-infinispan-session-management-item").click();
    cy.selectInTable(infinispanSessionManagementTableId, infinispanSessionManagements.update.name);
    cy.editForm(configurationFormId);
    cy.formInput(configurationFormId, granularity).select("ATTRIBUTE", {
      force: true,
    });
    cy.formInput(configurationFormId, granularity).trigger("change", {
      force: true,
    });
    cy.formInput(configurationFormId, granularity).should("have.value", "ATTRIBUTE");
    cy.saveForm(configurationFormId);
    cy.verifyAttribute(
      managementEndpoint,
      ["subsystem", "distributable-web", "infinispan-session-management", infinispanSessionManagements.update.name],
      granularity,
      "ATTRIBUTE"
    );
  });

  it("Reset Infinispan Session Management", () => {
    cy.navigateTo(managementEndpoint, "distributable-web");
    cy.get("#dw-infinispan-session-management-item").click();
    cy.selectInTable(infinispanSessionManagementTableId, infinispanSessionManagements.reset.name);
    cy.resetForm(configurationFormId, managementEndpoint, [
      "subsystem",
      "distributable-web",
      "infinispan-session-management",
      infinispanSessionManagements.reset.name,
    ]);
  });

  it("Delete Infinispan Session Management", () => {
    cy.validateAddress(
      managementEndpoint,
      ["subsystem", "distributable-web", "infinispan-session-management", infinispanSessionManagements.delete.name],
      true
    );
    cy.navigateTo(managementEndpoint, "distributable-web");
    cy.get("#dw-infinispan-session-management-item").click();
    cy.removeFromTable(infinispanSessionManagementTableId, infinispanSessionManagements.delete.name);
    cy.verifySuccess();
    cy.validateAddress(
      managementEndpoint,
      ["subsystem", "distributable-web", "infinispan-session-management", infinispanSessionManagements.delete.name],
      false
    );
  });
});
