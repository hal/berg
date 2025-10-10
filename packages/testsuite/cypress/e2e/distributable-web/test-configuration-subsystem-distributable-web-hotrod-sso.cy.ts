describe("TESTS: Configuration => Subsystem => Distributable Web => HotRod SSO", () => {
  let managementEndpoint: string;

  const configurationFormId = "dw-hotrod-sso-management-form";
  const hotrodSsoManagementTableId = "dw-hotrod-sso-management-table";

  const outBoundSocketBinding = {
    name: "custom-outbound-socket-binding",
    host: "localhost",
    port: "15099",
  };

  const remoteCacheContainers = {
    create: {
      name: "rcc-to-create",
      "default-remote-cluster": "rc-to-create",
    },
    update: {
      name: "rcc-to-update",
      "default-remote-cluster": "rc-to-update",
    },
  };

  const hotRodSingleSignOnManagements = {
    create: {
      name: "hrssom-to-create",
      "remote-cache-container": remoteCacheContainers.create.name,
    },
    update: {
      name: "hrssom-to-update",
      "remote-cache-container": remoteCacheContainers.create.name,
    },
    delete: {
      name: "hrssom-to-delete",
      "remote-cache-container": remoteCacheContainers.create.name,
    },
    reset: {
      name: "hrssom-to-reset",
      "remote-cache-container": remoteCacheContainers.create.name,
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
          [
            "socket-binding-group",
            "standard-sockets",
            "remote-destination-outbound-socket-binding",
            outBoundSocketBinding.name,
          ],
          {
            host: outBoundSocketBinding.host,
            port: outBoundSocketBinding.port,
          },
        );
        cy.task("execute:cli", {
          operation: "composite",
          managementApi: `${managementEndpoint}/management`,
          steps: [
            {
              operation: "add",
              address: ["subsystem", "infinispan", "remote-cache-container", remoteCacheContainers.create.name],
              "default-remote-cluster": remoteCacheContainers.create["default-remote-cluster"],
            },
            {
              operation: "add",
              address: [
                "subsystem",
                "infinispan",
                "remote-cache-container",
                remoteCacheContainers.create.name,
                "remote-cluster",
                remoteCacheContainers.create["default-remote-cluster"],
              ],
              "socket-bindings": [outBoundSocketBinding.name],
            },
          ],
        });
        cy.task("execute:cli", {
          operation: "composite",
          managementApi: `${managementEndpoint}/management`,
          steps: [
            {
              operation: "add",
              address: ["subsystem", "infinispan", "remote-cache-container", remoteCacheContainers.update.name],
              "default-remote-cluster": remoteCacheContainers.update["default-remote-cluster"],
            },
            {
              operation: "add",
              address: [
                "subsystem",
                "infinispan",
                "remote-cache-container",
                remoteCacheContainers.update.name,
                "remote-cluster",
                remoteCacheContainers.update["default-remote-cluster"],
              ],
              "socket-bindings": [outBoundSocketBinding.name],
            },
          ],
        });
        cy.addAddress(
          managementEndpoint,
          [
            "subsystem",
            "distributable-web",
            "hotrod-single-sign-on-management",
            hotRodSingleSignOnManagements.update.name,
          ],
          {
            "remote-cache-container": hotRodSingleSignOnManagements.update["remote-cache-container"],
          },
        );
        cy.addAddress(
          managementEndpoint,
          [
            "subsystem",
            "distributable-web",
            "hotrod-single-sign-on-management",
            hotRodSingleSignOnManagements.reset.name,
          ],
          {
            "remote-cache-container": hotRodSingleSignOnManagements.reset["remote-cache-container"],
          },
        );
        cy.addAddress(
          managementEndpoint,
          [
            "subsystem",
            "distributable-web",
            "hotrod-single-sign-on-management",
            hotRodSingleSignOnManagements.delete.name,
          ],
          {
            "remote-cache-container": hotRodSingleSignOnManagements.delete["remote-cache-container"],
          },
        );
      });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Create HotRod SSO Management", () => {
    cy.navigateTo(managementEndpoint, "distributable-web");
    cy.get("#dw-hotrod-sso-management-item").click();
    cy.addInTable(hotrodSsoManagementTableId);
    cy.text("dw-hotrod-sso-management-table-add", "name", hotRodSingleSignOnManagements.create.name);
    cy.text(
      "dw-hotrod-sso-management-table-add",
      "remote-cache-container",
      hotRodSingleSignOnManagements.create["remote-cache-container"],
    );
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.validateAddress(
      managementEndpoint,
      ["subsystem", "distributable-web", "hotrod-single-sign-on-management", hotRodSingleSignOnManagements.create.name],
      true,
    );
  });

  it("Edit cache-configuration", () => {
    cy.navigateTo(managementEndpoint, "distributable-web");
    cy.get("#dw-hotrod-sso-management-item").click();
    cy.selectInTable(hotrodSsoManagementTableId, hotRodSingleSignOnManagements.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "cache-configuration", "example");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      ["subsystem", "distributable-web", "hotrod-single-sign-on-management", hotRodSingleSignOnManagements.update.name],
      "cache-configuration",
      "example",
    );
  });

  it("Edit remote-cache-container", () => {
    cy.navigateTo(managementEndpoint, "distributable-web");
    cy.get("#dw-hotrod-sso-management-item").click();
    cy.selectInTable(hotrodSsoManagementTableId, hotRodSingleSignOnManagements.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "remote-cache-container", remoteCacheContainers.update.name);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      ["subsystem", "distributable-web", "hotrod-single-sign-on-management", hotRodSingleSignOnManagements.update.name],
      "remote-cache-container",
      remoteCacheContainers.update.name,
    );
  });

  it("Delete HotRod SSO Management", () => {
    cy.validateAddress(
      managementEndpoint,
      ["subsystem", "distributable-web", "hotrod-single-sign-on-management", hotRodSingleSignOnManagements.delete.name],
      true,
    );
    cy.navigateTo(managementEndpoint, "distributable-web");
    cy.get("#dw-hotrod-sso-management-item").click();
    cy.removeFromTable(hotrodSsoManagementTableId, hotRodSingleSignOnManagements.delete.name);
    cy.verifySuccess();
    cy.validateAddress(
      managementEndpoint,
      ["subsystem", "distributable-web", "hotrod-single-sign-on-management", hotRodSingleSignOnManagements.delete.name],
      false,
    );
  });

  it("Reset HotRod SSO Management", () => {
    cy.navigateTo(managementEndpoint, "distributable-web");
    cy.get("#dw-hotrod-sso-management-item").click();
    cy.selectInTable(hotrodSsoManagementTableId, hotRodSingleSignOnManagements.reset.name);
    cy.resetForm(configurationFormId, managementEndpoint, [
      "subsystem",
      "distributable-web",
      "hotrod-single-sign-on-management",
      hotRodSingleSignOnManagements.reset.name,
    ]);
  });
});
