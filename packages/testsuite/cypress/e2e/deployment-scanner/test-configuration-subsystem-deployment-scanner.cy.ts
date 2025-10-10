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

  const deploymentScannerTableId = "deployment-scanner-table";

  const address = ["subsystem", "deployment-scanner", "scanner"];

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
      cy.addAddress(managementEndpoint, address.concat(deploymentScanners.delete.name), {
        path: deploymentScanners.delete.path,
      });
      cy.addAddress(managementEndpoint, address.concat(deploymentScanners.update.name), {
        path: deploymentScanners.update.path,
      });
      cy.addAddress(managementEndpoint, address.concat(deploymentScanners.reset.name), {
        path: deploymentScanners.reset.path,
      });
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Create Deployment Scanner", () => {
    cy.navigateTo(managementEndpoint, "deployment-scanner");
    cy.addInTable(deploymentScannerTableId);
    cy.text("deployment-scanner-table-add", "name", deploymentScanners.create.name);
    cy.text("deployment-scanner-table-add", "path", deploymentScanners.create.path);
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.validateAddress(managementEndpoint, address.concat(deploymentScanners.create.name), true);
  });

  it("Toggle auto-deploy-exploded", () => {
    let value = false;
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: address.concat(deploymentScanners.update.name),
      name: autoDeployExploded,
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "deployment-scanner");
      cy.selectInTable(deploymentScannerTableId, deploymentScanners.update.name);
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, autoDeployExploded, value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(
        managementEndpoint,
        address.concat(deploymentScanners.update.name),
        autoDeployExploded,
        !value,
      );
    });
  });

  it("Toggle auto-deploy-xml", () => {
    let value = false;
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: address.concat(deploymentScanners.update.name),
      name: autoDeployXml,
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "deployment-scanner");
      cy.selectInTable(deploymentScannerTableId, deploymentScanners.update.name);
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, autoDeployXml, value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address.concat(deploymentScanners.update.name), autoDeployXml, !value);
    });
  });

  it("Toggle auto-deploy-zipped", () => {
    let value = false;
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: address.concat(deploymentScanners.update.name),
      name: autoDeployZipped,
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "deployment-scanner");
      cy.selectInTable(deploymentScannerTableId, deploymentScanners.update.name);
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, autoDeployZipped, value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address.concat(deploymentScanners.update.name), autoDeployZipped, !value);
    });
  });

  it("Edit deployment-timeout", () => {
    cy.navigateTo(managementEndpoint, "deployment-scanner");
    cy.selectInTable(deploymentScannerTableId, deploymentScanners.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, deploymentTimeout, "1000");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address.concat(deploymentScanners.update.name), deploymentTimeout, 1000);
  });

  it("Edit path", () => {
    cy.navigateTo(managementEndpoint, "deployment-scanner");
    cy.selectInTable(deploymentScannerTableId, deploymentScanners.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, path, "another-dir");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address.concat(deploymentScanners.update.name), path, "another-dir");
  });

  it("Edit relative-to", () => {
    cy.navigateTo(managementEndpoint, "deployment-scanner");
    cy.selectInTable(deploymentScannerTableId, deploymentScanners.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, relativeTo, "jboss.server.base.dir");
    cy.saveForm(configurationFormId);
    cy.verifyAttribute(
      managementEndpoint,
      address.concat(deploymentScanners.update.name),
      relativeTo,
      "jboss.server.base.dir",
    );
  });

  it("Toggle runtime-failure-causes-rollback", () => {
    let value = false;
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: address.concat(deploymentScanners.update.name),
      name: runtimeFailureCausesRollback,
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "deployment-scanner");
      cy.selectInTable(deploymentScannerTableId, deploymentScanners.update.name);
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, runtimeFailureCausesRollback, value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(
        managementEndpoint,
        address.concat(deploymentScanners.update.name),
        runtimeFailureCausesRollback,
        !value,
      );
    });
  });

  it("Toggle scan-enabled", () => {
    let value = false;
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: address.concat(deploymentScanners.update.name),
      name: scanEnabled,
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "deployment-scanner");
      cy.selectInTable(deploymentScannerTableId, deploymentScanners.update.name);
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, scanEnabled, value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address.concat(deploymentScanners.update.name), scanEnabled, !value);
    });
  });

  it("Edit scan-interval", () => {
    cy.navigateTo(managementEndpoint, "deployment-scanner");
    cy.selectInTable(deploymentScannerTableId, deploymentScanners.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, scanInterval, "1000");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address.concat(deploymentScanners.update.name), scanInterval, 1000);
  });

  it("Remove", () => {
    cy.navigateTo(managementEndpoint, "deployment-scanner");
    cy.removeFromTable(deploymentScannerTableId, deploymentScanners.delete.name);
    cy.verifySuccess();
    cy.validateAddress(managementEndpoint, address.concat(deploymentScanners.delete.name), false);
  });

  it("Reset", () => {
    cy.navigateTo(managementEndpoint, "deployment-scanner");
    cy.selectInTable(deploymentScannerTableId, deploymentScanners.reset.name);
    cy.resetForm(configurationFormId, managementEndpoint, address.concat(deploymentScanners.reset.name));
  });
});
