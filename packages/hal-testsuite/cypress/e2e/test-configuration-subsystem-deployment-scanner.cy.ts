describe("TESTS: Configuration => Subsystem => Deployment Scanner", () => {
  let managementEndpoint: string;

  const deploymentScanners = {
    create: {
      name: "deployment-scanner-to-create",
      path: "temp-create",
    },
    delete: {
      name: "deployment-scanner-to-delete",
      path: "temp-delete",
    },
    update: {
      name: "deployment-scanner-to-update",
      path: "temp-update",
    },
    reset: {
      name: "deployment-scanner-to-reset",
      path: "temp-reset",
    },
  };

  const autoDeployExploded = "auto-deploy-exploded";
  const autoDeployXml = "auto-deploy-xml";
  const autoDeployZipped = "auto-deploy-zipped";
  const deploymentTimeout = "deployment-timeout";
  const path = "path";
  const relativeTo = "relative-to";
  const runtimeFailureCausesRollback = "runtime-failure-causes-rollback";
  const scanEnabled = "scan-enabled";
  const scanInterval = "scan-interval";
  const configurationFormId = "deployment-scanner-form";

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
      cy.addAddress(
        managementEndpoint,
        [
          "subsystem",
          "deployment-scanner",
          "scanner",
          deploymentScanners.delete.name,
        ],
        {
          path: deploymentScanners.delete.path,
        }
      );
      cy.addAddress(
        managementEndpoint,
        [
          "subsystem",
          "deployment-scanner",
          "scanner",
          deploymentScanners.update.name,
        ],
        {
          path: deploymentScanners.update.path,
        }
      );
      cy.addAddress(
        managementEndpoint,
        [
          "subsystem",
          "deployment-scanner",
          "scanner",
          deploymentScanners.reset.name,
        ],
        {
          path: deploymentScanners.reset.path,
        }
      );
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Toggle auto-deploy-exploded", () => {
    let value = false;
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: [
        "subsystem",
        "deployment-scanner",
        "scanner",
        deploymentScanners.update.name,
      ],
      name: autoDeployExploded,
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "deployment-scanner");
      cy.get(
        '#deployment-scanner-table td:contains("' +
          deploymentScanners.update.name +
          '")'
      ).click();
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, autoDeployExploded, value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(
        managementEndpoint,
        [
          "subsystem",
          "deployment-scanner",
          "scanner",
          deploymentScanners.update.name,
        ],
        autoDeployExploded,
        !value
      );
    });
  });

  it("Toggle auto-deploy-xml", () => {
    let value = false;
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: [
        "subsystem",
        "deployment-scanner",
        "scanner",
        deploymentScanners.update.name,
      ],
      name: autoDeployXml,
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "deployment-scanner");
      cy.get(
        '#deployment-scanner-table td:contains("' +
          deploymentScanners.update.name +
          '")'
      ).click();
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, autoDeployXml, value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(
        managementEndpoint,
        [
          "subsystem",
          "deployment-scanner",
          "scanner",
          deploymentScanners.update.name,
        ],
        autoDeployXml,
        !value
      );
    });
  });

  it("Toggle auto-deploy-zipped", () => {
    let value = false;
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: [
        "subsystem",
        "deployment-scanner",
        "scanner",
        deploymentScanners.update.name,
      ],
      name: autoDeployZipped,
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "deployment-scanner");
      cy.get(
        '#deployment-scanner-table td:contains("' +
          deploymentScanners.update.name +
          '")'
      ).click();
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, autoDeployZipped, value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(
        managementEndpoint,
        [
          "subsystem",
          "deployment-scanner",
          "scanner",
          deploymentScanners.update.name,
        ],
        autoDeployZipped,
        !value
      );
    });
  });

  it("Edit deployment-timeout", () => {
    cy.navigateTo(managementEndpoint, "deployment-scanner");
    cy.get(
      '#deployment-scanner-table td:contains("' +
        deploymentScanners.update.name +
        '")'
    ).click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, deploymentTimeout, "1000");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      [
        "subsystem",
        "deployment-scanner",
        "scanner",
        deploymentScanners.update.name,
      ],
      deploymentTimeout,
      1000
    );
  });

  it("Edit path", () => {
    cy.navigateTo(managementEndpoint, "deployment-scanner");
    cy.get(
      '#deployment-scanner-table td:contains("' +
        deploymentScanners.update.name +
        '")'
    ).click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, path, "another-dir");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      [
        "subsystem",
        "deployment-scanner",
        "scanner",
        deploymentScanners.update.name,
      ],
      path,
      "another-dir"
    );
  });

  it("Edit relative-to", () => {
    cy.navigateTo(managementEndpoint, "deployment-scanner");
    cy.get(
      '#deployment-scanner-table td:contains("' +
        deploymentScanners.update.name +
        '")'
    ).click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, relativeTo, "another-dir");
    cy.saveForm(configurationFormId);
    cy.verifyAttribute(
      managementEndpoint,
      [
        "subsystem",
        "deployment-scanner",
        "scanner",
        deploymentScanners.update.name,
      ],
      relativeTo,
      "another-dir"
    );
  });

  it("Toggle runtime-failure-causes-rollback", () => {
    let value = false;
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: [
        "subsystem",
        "deployment-scanner",
        "scanner",
        deploymentScanners.update.name,
      ],
      name: runtimeFailureCausesRollback,
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "deployment-scanner");
      cy.get(
        '#deployment-scanner-table td:contains("' +
          deploymentScanners.update.name +
          '")'
      ).click();
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, runtimeFailureCausesRollback, value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(
        managementEndpoint,
        [
          "subsystem",
          "deployment-scanner",
          "scanner",
          deploymentScanners.update.name,
        ],
        runtimeFailureCausesRollback,
        !value
      );
    });
  });

  it("Toggle scan-enabled", () => {
    let value = false;
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: [
        "subsystem",
        "deployment-scanner",
        "scanner",
        deploymentScanners.update.name,
      ],
      name: scanEnabled,
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "deployment-scanner");
      cy.get(
        '#deployment-scanner-table td:contains("' +
          deploymentScanners.update.name +
          '")'
      ).click();
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, scanEnabled, value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(
        managementEndpoint,
        [
          "subsystem",
          "deployment-scanner",
          "scanner",
          deploymentScanners.update.name,
        ],
        scanEnabled,
        !value
      );
    });
  });

  it("Edit scan-interval", () => {
    cy.navigateTo(managementEndpoint, "deployment-scanner");
    cy.get(
      '#deployment-scanner-table td:contains("' +
        deploymentScanners.update.name +
        '")'
    ).click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, scanInterval, "1000");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      [
        "subsystem",
        "deployment-scanner",
        "scanner",
        deploymentScanners.update.name,
      ],
      scanInterval,
      1000
    );
  });
});
