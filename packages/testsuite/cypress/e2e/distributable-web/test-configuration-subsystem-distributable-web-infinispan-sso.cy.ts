describe("TESTS: Configuration => Subsystem => Distributable Web => Infinispan SSO", () => {
  let managementEndpoint: string;

  const infinispanSsoManagementTableId = "dw-infinispan-sso-management-table";
  const configurationFormId = "dw-infinispan-sso-management-form";

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

  const infinispanSingleSignOnManagements = {
    create: {
      name: "issom-to-add",
      "cache-container": cacheContainers.create.name,
    },
    update: {
      name: "issom-to-update",
      "cache-container": cacheContainers.create.name,
    },
    delete: {
      name: "issom-to-delete",
      "cache-container": cacheContainers.create.name,
    },
    reset: {
      name: "issom-to-reset",
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
        cy.addAddress(
          managementEndpoint,
          [
            "subsystem",
            "distributable-web",
            "infinispan-single-sign-on-management",
            infinispanSingleSignOnManagements.update.name,
          ],
          {
            "cache-container": infinispanSingleSignOnManagements.update["cache-container"],
          },
        );
        cy.addAddress(
          managementEndpoint,
          [
            "subsystem",
            "distributable-web",
            "infinispan-single-sign-on-management",
            infinispanSingleSignOnManagements.delete.name,
          ],
          {
            "cache-container": infinispanSingleSignOnManagements.delete["cache-container"],
          },
        );
        cy.addAddress(
          managementEndpoint,
          [
            "subsystem",
            "distributable-web",
            "infinispan-single-sign-on-management",
            infinispanSingleSignOnManagements.reset.name,
          ],
          {
            "cache-container": infinispanSingleSignOnManagements.reset["cache-container"],
          },
        );
      });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Create Infinispan SSO Management", () => {
    cy.navigateTo(managementEndpoint, "distributable-web");
    cy.get("#dw-infinispan-sso-management-item").click();
    cy.addInTable(infinispanSsoManagementTableId);
    cy.text("dw-infinispan-sso-management-table-add", "name", infinispanSingleSignOnManagements.create.name);
    cy.text(
      "dw-infinispan-sso-management-table-add",
      "cache-container",
      infinispanSingleSignOnManagements.create["cache-container"],
    );
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.validateAddress(
      managementEndpoint,
      [
        "subsystem",
        "distributable-web",
        "infinispan-single-sign-on-management",
        infinispanSingleSignOnManagements.create.name,
      ],
      true,
    );
  });

  it("Edit cache", () => {
    cy.navigateTo(managementEndpoint, "distributable-web");
    cy.get("#dw-infinispan-sso-management-item").click();
    cy.selectInTable(infinispanSsoManagementTableId, infinispanSingleSignOnManagements.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "cache", cacheToUpdate);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      [
        "subsystem",
        "distributable-web",
        "infinispan-single-sign-on-management",
        infinispanSingleSignOnManagements.update.name,
      ],
      "cache",
      cacheToUpdate,
    );
  });

  it("Edit cache-container", () => {
    cy.navigateTo(managementEndpoint, "distributable-web");
    cy.get("#dw-infinispan-sso-management-item").click();
    cy.selectInTable(infinispanSsoManagementTableId, infinispanSingleSignOnManagements.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "cache-container", cacheContainers.update.name);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      [
        "subsystem",
        "distributable-web",
        "infinispan-single-sign-on-management",
        infinispanSingleSignOnManagements.update.name,
      ],
      "cache-container",
      cacheContainers.update.name,
    );
  });

  it("Reset Infinispan SSO Management", () => {
    cy.navigateTo(managementEndpoint, "distributable-web");
    cy.get("#dw-infinispan-sso-management-item").click();
    cy.selectInTable(infinispanSsoManagementTableId, infinispanSingleSignOnManagements.reset.name);
    cy.resetForm(configurationFormId, managementEndpoint, [
      "subsystem",
      "distributable-web",
      "infinispan-single-sign-on-management",
      infinispanSingleSignOnManagements.reset.name,
    ]);
  });

  it("Delete Infinispan SSO Management", () => {
    cy.validateAddress(
      managementEndpoint,
      [
        "subsystem",
        "distributable-web",
        "infinispan-single-sign-on-management",
        infinispanSingleSignOnManagements.delete.name,
      ],
      true,
    );
    cy.navigateTo(managementEndpoint, "distributable-web");
    cy.get("#dw-infinispan-sso-management-item").click();
    cy.removeFromTable(infinispanSsoManagementTableId, infinispanSingleSignOnManagements.delete.name);
    cy.verifySuccess();
    cy.validateAddress(
      managementEndpoint,
      [
        "subsystem",
        "distributable-web",
        "infinispan-single-sign-on-management",
        infinispanSingleSignOnManagements.delete.name,
      ],
      false,
    );
  });
});
