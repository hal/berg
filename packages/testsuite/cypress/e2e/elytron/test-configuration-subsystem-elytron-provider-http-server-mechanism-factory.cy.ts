describe("TESTS: Configuration => Subsystem => Security => Settings => Factories/Transformers => HTTP Factories => Provider HTTP Server Mechanism Factory", () => {
  let managementEndpoint: string;

  const address = ["subsystem", "elytron", "provider-http-server-mechanism-factory"];

  const configurationFormId = "elytron-provider-http-server-mechanism-factory-form";

  const providerHttpServerMechanismFactoryTableId = "elytron-provider-http-server-mechanism-factory-table";
  const providerHttpServiceMechanismFactories = {
    create: {
      name: "p-http-smf-create",
    },
    remove: {
      name: "p-http-smf-remove",
    },
    reset: {
      name: "p-http-smf-reset",
    },
    update: {
      name: "p-http-smf-update",
    },
  };

  before(() => {
    cy.startWildflyContainer()
      .then((result) => {
        managementEndpoint = result as string;
      })
      .then(() => {
        cy.addAddress(managementEndpoint, address.concat(providerHttpServiceMechanismFactories.remove.name));
        cy.addAddress(managementEndpoint, address.concat(providerHttpServiceMechanismFactories.reset.name));
        cy.addAddress(managementEndpoint, address.concat(providerHttpServiceMechanismFactories.update.name));
        cy.addAddress(managementEndpoint, ["subsystem", "elytron", "provider-loader", "pl-to-update"]);
      });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Create", () => {
    cy.navigateTo(managementEndpoint, "elytron-factories-transformers");
    cy.get("#http-factories-item").click();
    cy.get("#elytron-provider-http-server-mechanism-factory-item").click();
    cy.addInTable(providerHttpServerMechanismFactoryTableId);
    cy.text(
      "elytron-provider-http-server-mechanism-factory-add",
      "name",
      providerHttpServiceMechanismFactories.create.name,
    );
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.validateAddress(managementEndpoint, address.concat(providerHttpServiceMechanismFactories.create.name), true);
  });

  it("Remove", () => {
    cy.navigateTo(managementEndpoint, "elytron-factories-transformers");
    cy.get("#http-factories-item").click();
    cy.get("#elytron-provider-http-server-mechanism-factory-item").click();
    cy.removeFromTable(providerHttpServerMechanismFactoryTableId, providerHttpServiceMechanismFactories.remove.name);
    cy.verifySuccess();
    cy.validateAddress(managementEndpoint, address.concat(providerHttpServiceMechanismFactories.remove.name), false);
  });

  it("Reset", () => {
    cy.navigateTo(managementEndpoint, "elytron-factories-transformers");
    cy.get("#http-factories-item").click();
    cy.get("#elytron-provider-http-server-mechanism-factory-item").click();
    cy.selectInTable(providerHttpServerMechanismFactoryTableId, providerHttpServiceMechanismFactories.reset.name);
    cy.resetForm(
      configurationFormId,
      managementEndpoint,
      address.concat(providerHttpServiceMechanismFactories.reset.name),
    );
  });

  it("Edit providers", () => {
    cy.navigateTo(managementEndpoint, "elytron-factories-transformers");
    cy.get("#http-factories-item").click();
    cy.get("#elytron-provider-http-server-mechanism-factory-item").click();
    cy.selectInTable(providerHttpServerMechanismFactoryTableId, providerHttpServiceMechanismFactories.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "providers", "pl-to-update");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      address.concat(providerHttpServiceMechanismFactories.update.name),
      "providers",
      "pl-to-update",
    );
  });
});
