describe("TESTS: Configuration => Subsystem => Distributable Web => Configuration", () => {
  let managementEndpoint: string;

  const configurationFormId = "dw-configuration-form";

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
  };

  const hotRodSessionManagements = {
    create: {
      name: "hrsm-to-update",
      granularity: "SESSION",
      "remote-cache-container": remoteCacheContainers.create.name,
    },
  };

  const hotRodSingleSignOnManagements = {
    create: {
      name: "hrssom-to-create",
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
        cy.addAddress(
          managementEndpoint,
          [
            "subsystem",
            "distributable-web",
            "hotrod-session-management",
            hotRodSessionManagements.create.name,
          ],
          {
            granularity: hotRodSessionManagements.create.granularity,
            "remote-cache-container":
              hotRodSessionManagements.create["remote-cache-container"],
          }
        );
        cy.addAddress(
          managementEndpoint,
          [
            "subsystem",
            "distributable-web",
            "hotrod-single-sign-on-management",
            hotRodSingleSignOnManagements.create.name,
          ],
          {
            "remote-cache-container":
              hotRodSingleSignOnManagements.create["remote-cache-container"],
          }
        );
      });
  });

  it("Edit default-session-management", () => {
    cy.navigateTo(managementEndpoint, "distributable-web");
    cy.get("#dw-configuration-item").click();
    cy.editForm(configurationFormId);
    cy.text(
      configurationFormId,
      "default-session-management",
      hotRodSessionManagements.create.name
    );
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      ["subsystem", "distributable-web"],
      "default-session-management",
      hotRodSessionManagements.create.name
    );
  });

  it("Edit default-single-sign-on-management", () => {
    cy.navigateTo(managementEndpoint, "distributable-web");
    cy.get("#dw-configuration-item").click();
    cy.editForm(configurationFormId);
    cy.text(
      configurationFormId,
      "default-single-sign-on-management",
      hotRodSessionManagements.create.name
    );
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      ["subsystem", "distributable-web"],
      "default-single-sign-on-management",
      hotRodSingleSignOnManagements.create.name
    );
  });

  it("Reset", () => {
    cy.navigateTo(managementEndpoint, "distributable-web");
    cy.get("#dw-configuration-item").click();
    cy.resetForm(configurationFormId, managementEndpoint, [
      "subsystem",
      "distributable-web",
    ]);
  });

  after(() => {
    cy.task("stop:containers");
  });
});
