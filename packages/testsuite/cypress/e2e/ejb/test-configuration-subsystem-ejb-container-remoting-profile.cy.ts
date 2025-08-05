describe("TESTS: Configuration => Subsystem => EJB => Container => Remoting Profile", () => {
  let managementEndpoint: string;

  const address = ["subsystem", "ejb3", "remoting-profile"];
  const remotingProfilesTableId = "remoting-profile-table";
  const configurationFormId = "remoting-profile-form";

  const remotingProfiles = {
    create: {
      name: "rp-to-create",
    },
    update: {
      name: "rp-to-update",
    },
    remove: {
      name: "rp-to-remove",
    },
    reset: {
      name: "rp-to-reset",
    },
  };

  before(() => {
    cy.startWildflyContainer()
      .then((result) => {
        managementEndpoint = result as string;
      })
      .then(() => {
        cy.addAddress(managementEndpoint, address.concat(remotingProfiles.update.name));
        cy.addAddress(managementEndpoint, address.concat(remotingProfiles.remove.name));
        cy.addAddress(managementEndpoint, address.concat(remotingProfiles.reset.name));
      });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Create Remoting Profile", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-container-item").click();
    cy.get("#remoting-profile-item").click();
    cy.addInTable(remotingProfilesTableId);
    cy.text("remoting-profile-table-add", "name", remotingProfiles.create.name);
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.validateAddress(managementEndpoint, address.concat(remotingProfiles.create.name), true);
  });

  it("Toggle exclude-local-receiver", () => {
    let value = false;
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: address.concat(remotingProfiles.update.name),
      name: "exclude-local-receiver",
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "ejb3-configuration");
      cy.get("#ejb3-container-item").click();
      cy.get("#remoting-profile-item").click();
      cy.selectInTable(remotingProfilesTableId, remotingProfiles.update.name);
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, "exclude-local-receiver", value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(
        managementEndpoint,
        address.concat(remotingProfiles.update.name),
        "exclude-local-receiver",
        !value
      );
    });
  });

  it("Toggle local-receiver-pass-by-value", () => {
    let value = false;
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: address.concat(remotingProfiles.update.name),
      name: "local-receiver-pass-by-value",
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "ejb3-configuration");
      cy.get("#ejb3-container-item").click();
      cy.get("#remoting-profile-item").click();
      cy.selectInTable(remotingProfilesTableId, remotingProfiles.update.name);
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, "local-receiver-pass-by-value", value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(
        managementEndpoint,
        address.concat(remotingProfiles.update.name),
        "local-receiver-pass-by-value",
        !value
      );
    });
  });

  it("Edit static-ejb-discovery via type", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-container-item").click();
    cy.get("#remoting-profile-item").click();
    cy.selectInTable(remotingProfilesTableId, remotingProfiles.update.name);
    cy.editForm(configurationFormId);
    cy.formInput(configurationFormId, "static-ejb-discovery")
      .clear()
      .type("someUri,someAppName,someModule,someDistinctName{enter}")
      .trigger("change");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyListAttributeContains(
      managementEndpoint,
      address.concat(remotingProfiles.update.name),
      "static-ejb-discovery",
      {
        uri: "someUri",
        "app-name": "someAppName",
        "module-name": "someModule",
        "distinct-name": "someDistinctName",
      }
    );
  });

  it("Edit static-ejb-discovery via wizard", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-container-item").click();
    cy.get("#remoting-profile-item").click();
    cy.selectInTable(remotingProfilesTableId, remotingProfiles.update.name);
    cy.editForm(configurationFormId);
    cy.formInput(configurationFormId, "static-ejb-discovery")
      .parent()
      .within(() => {
        cy.get(".btn.btn-default").click();
      });
    cy.text("resolve-expression-form", "app-name", "anotherApp");
    cy.text("resolve-expression-form", "distinct-name", "anotherDistinctName");
    cy.text("resolve-expression-form", "module-name", "anotherModule");
    cy.text("resolve-expression-form", "uri", "anotherUri");
    cy.confirmAddResourceWizard();
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyListAttributeContains(
      managementEndpoint,
      address.concat(remotingProfiles.update.name),
      "static-ejb-discovery",
      {
        uri: "anotherUri",
        "app-name": "anotherApp",
        "module-name": "anotherModule",
        "distinct-name": "anotherDistinctName",
      }
    );
  });

  it("Remove", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-container-item").click();
    cy.get("#remoting-profile-item").click();
    cy.removeFromTable(remotingProfilesTableId, remotingProfiles.remove.name);
    cy.verifySuccess();
    cy.validateAddress(managementEndpoint, address.concat(remotingProfiles.remove.name), false);
  });

  it("Reset", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-container-item").click();
    cy.get("#remoting-profile-item").click();
    cy.selectInTable(remotingProfilesTableId, remotingProfiles.reset.name);
    cy.resetForm(configurationFormId, managementEndpoint, address.concat(remotingProfiles.reset.name));
  });
});
