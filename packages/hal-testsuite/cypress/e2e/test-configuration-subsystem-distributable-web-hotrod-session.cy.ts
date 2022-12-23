describe("TESTS: Configuration => Subsystem => Distributable Web => HotRod Session", () => {
  let managementEndpoint: string;
  const configurationFormId = "dw-hotrod-session-management-form";
  const granularity = "granularity";
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
  const hotRodSessionManagements = {
    create: {
      name: "hrsm-to-create",
      granularity: "SESSION",
      "remote-cache-container": remoteCacheContainers.create.name,
    },
    update: {
      name: "hrsm-to-update",
      granularity: "SESSION",
      "remote-cache-container": remoteCacheContainers.create.name,
    },
    delete: {
      name: "hrsm-to-delete",
      granularity: "SESSION",
      "remote-cache-container": remoteCacheContainers.create.name,
    },
    reset: {
      name: "hrsm-to-reset",
      granularity: "SESSION",
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
          }
        );
        cy.task("execute:cli", {
          operation: "composite",
          managementApi: `${managementEndpoint}/management`,
          steps: [
            {
              operation: "add",
              address: [
                "subsystem",
                "infinispan",
                "remote-cache-container",
                remoteCacheContainers.create.name,
              ],
              "default-remote-cluster":
                remoteCacheContainers.create["default-remote-cluster"],
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
              address: [
                "subsystem",
                "infinispan",
                "remote-cache-container",
                remoteCacheContainers.update.name,
              ],
              "default-remote-cluster":
                remoteCacheContainers.update["default-remote-cluster"],
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
            "hotrod-session-management",
            hotRodSessionManagements.delete.name,
          ],
          {
            granularity: hotRodSessionManagements.delete.granularity,
            "remote-cache-container":
              hotRodSessionManagements.delete["remote-cache-container"],
          }
        );
        cy.addAddress(
          managementEndpoint,
          [
            "subsystem",
            "distributable-web",
            "hotrod-session-management",
            hotRodSessionManagements.update.name,
          ],
          {
            granularity: hotRodSessionManagements.update.granularity,
            "remote-cache-container":
              hotRodSessionManagements.update["remote-cache-container"],
          }
        );
        cy.addAddress(
          managementEndpoint,
          [
            "subsystem",
            "distributable-web",
            "hotrod-session-management",
            hotRodSessionManagements.reset.name,
          ],
          {
            granularity: hotRodSessionManagements.reset.granularity,
            "remote-cache-container":
              hotRodSessionManagements.reset["remote-cache-container"],
          }
        );
      });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Create HotRod Session Management", () => {
    cy.navigateTo(managementEndpoint, "distributable-web");
    cy.get("#dw-hotrod-session-management-item").click();
    cy.get(
      '#dw-hotrod-session-management-table_wrapper button.btn.btn-default > span:contains("Add")'
    ).click();
    cy.text(
      "dw-hotrod-session-management-table-add",
      "name",
      hotRodSessionManagements.create.name
    );
    cy.text(
      "dw-hotrod-session-management-table-add",
      "remote-cache-container",
      hotRodSessionManagements.create["remote-cache-container"]
    );
    cy.get(
      'div.modal-footer > button.btn.btn-hal.btn-primary:contains("Add")'
    ).click();
    cy.verifySuccess();
    cy.validateAddress(
      managementEndpoint,
      [
        "subsystem",
        "distributable-web",
        "hotrod-session-management",
        hotRodSessionManagements.create.name,
      ],
      true
    );
  });

  it("Reset HotRod Session Management", () => {
    cy.navigateTo(managementEndpoint, "distributable-web");
    cy.get("#dw-hotrod-session-management-item").click();
    cy.get(
      '#dw-hotrod-session-management-table_wrapper td:contains("' +
        hotRodSessionManagements.reset.name +
        '")'
    ).click();
    cy.resetForm(configurationFormId, `${managementEndpoint}/management`, [
      "subsystem",
      "distributable-web",
      "hotrod-session-management",
      hotRodSessionManagements.reset.name,
    ]);
  });

  it("Edit cache-configuration", () => {
    cy.navigateTo(managementEndpoint, "distributable-web");
    cy.get("#dw-hotrod-session-management-item").click();
    cy.get(
      '#dw-hotrod-session-management-table_wrapper td:contains("' +
        hotRodSessionManagements.update.name +
        '")'
    ).click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "cache-configuration", "example");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      [
        "subsystem",
        "distributable-web",
        "hotrod-session-management",
        hotRodSessionManagements.update.name,
      ],
      "cache-configuration",
      "example"
    );
  });

  it("Edit granularity", () => {
    cy.navigateTo(managementEndpoint, "distributable-web");
    cy.get("#dw-hotrod-session-management-item").click();
    cy.get(
      '#dw-hotrod-session-management-table_wrapper td:contains("' +
        hotRodSessionManagements.update.name +
        '")'
    ).click();
    cy.editForm(configurationFormId);
    cy.formInput(configurationFormId, granularity).select("ATTRIBUTE", {
      force: true,
    });
    cy.formInput(configurationFormId, granularity).trigger("change", {
      force: true,
    });
    cy.formInput(configurationFormId, granularity).should(
      "have.value",
      "ATTRIBUTE"
    );
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      [
        "subsystem",
        "distributable-web",
        "hotrod-session-management",
        hotRodSessionManagements.update.name,
      ],
      granularity,
      "ATTRIBUTE"
    );
  });

  it("Edit remote-cache-container", () => {
    cy.navigateTo(managementEndpoint, "distributable-web");
    cy.get("#dw-hotrod-session-management-item").click();
    cy.get(
      '#dw-hotrod-session-management-table_wrapper td:contains("' +
        hotRodSessionManagements.update.name +
        '")'
    ).click();
    cy.editForm(configurationFormId);
    cy.text(
      configurationFormId,
      "remote-cache-container",
      remoteCacheContainers.update.name
    );
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      [
        "subsystem",
        "distributable-web",
        "hotrod-session-management",
        hotRodSessionManagements.update.name,
      ],
      "remote-cache-container",
      remoteCacheContainers.update.name
    );
  });

  it("Delete HotRod Session Management", () => {
    cy.validateAddress(
      managementEndpoint,
      [
        "subsystem",
        "distributable-web",
        "hotrod-session-management",
        hotRodSessionManagements.delete.name,
      ],
      true
    );
    cy.navigateTo(managementEndpoint, "distributable-web");
    cy.get("#dw-hotrod-session-management-item").click();
    cy.get(
      '#dw-hotrod-session-management-table_wrapper td:contains("' +
        hotRodSessionManagements.delete.name +
        '")'
    ).click();
    cy.get(
      '#dw-hotrod-session-management-table_wrapper button.btn.btn-default > span:contains("Remove")'
    ).click();
    cy.get(
      'div.modal-footer > button.btn.btn-hal.btn-primary:contains("Yes")'
    ).click();
    cy.verifySuccess();
    cy.validateAddress(
      managementEndpoint,
      [
        "subsystem",
        "distributable-web",
        "hotrod-session-management",
        hotRodSessionManagements.delete.name,
      ],
      false
    );
  });
});
