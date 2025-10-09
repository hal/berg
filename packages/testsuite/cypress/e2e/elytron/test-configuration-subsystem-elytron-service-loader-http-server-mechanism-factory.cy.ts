describe("TESTS: Configuration => Subsystem => Security => Settings => Factories/Transformers => HTTP Factories => Service Loader HTTP Server Mechanism Factory", () => {
  let managementEndpoint: string;

  const address = ["subsystem", "elytron", "service-loader-http-server-mechanism-factory"];

  const configurationFormId = "elytron-service-loader-http-server-mechanism-factory-form";

  const serviceLoaderHttpServerMechanismFactoryTableId = "elytron-service-loader-http-server-mechanism-factory-table";
  const serviceLoaderHttpServiceMechanismFactories = {
    create: {
      name: "sl-http-smf-create",
    },
    remove: {
      name: "sl-http-smf-remove",
    },
    reset: {
      name: "sl-http-smf-reset",
    },
    update: {
      name: "sl-http-smf-update",
    },
  };

  before(() => {
    cy.startWildflyContainer()
      .then((result) => {
        managementEndpoint = result as string;
      })
      .then(() => {
        cy.addAddress(managementEndpoint, address.concat(serviceLoaderHttpServiceMechanismFactories.remove.name));
        cy.addAddress(managementEndpoint, address.concat(serviceLoaderHttpServiceMechanismFactories.reset.name));
        cy.addAddress(managementEndpoint, address.concat(serviceLoaderHttpServiceMechanismFactories.update.name));
      });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Create", () => {
    cy.navigateTo(managementEndpoint, "elytron-factories-transformers");
    cy.get("#http-factories-item").click();
    cy.get("#elytron-service-loader-http-server-mechanism-factory-item").click();
    cy.addInTable(serviceLoaderHttpServerMechanismFactoryTableId);
    cy.text(
      "elytron-service-loader-http-server-mechanism-factory-add",
      "name",
      serviceLoaderHttpServiceMechanismFactories.create.name,
    );
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.validateAddress(
      managementEndpoint,
      address.concat(serviceLoaderHttpServiceMechanismFactories.create.name),
      true,
    );
  });

  it("Remove", () => {
    cy.navigateTo(managementEndpoint, "elytron-factories-transformers");
    cy.get("#http-factories-item").click();
    cy.get("#elytron-service-loader-http-server-mechanism-factory-item").click();
    cy.removeFromTable(
      serviceLoaderHttpServerMechanismFactoryTableId,
      serviceLoaderHttpServiceMechanismFactories.remove.name,
    );
    cy.verifySuccess();
    cy.validateAddress(
      managementEndpoint,
      address.concat(serviceLoaderHttpServiceMechanismFactories.remove.name),
      false,
    );
  });

  it("Reset", () => {
    cy.navigateTo(managementEndpoint, "elytron-factories-transformers");
    cy.get("#http-factories-item").click();
    cy.get("#elytron-service-loader-http-server-mechanism-factory-item").click();
    cy.selectInTable(
      serviceLoaderHttpServerMechanismFactoryTableId,
      serviceLoaderHttpServiceMechanismFactories.reset.name,
    );
    cy.resetForm(
      configurationFormId,
      managementEndpoint,
      address.concat(serviceLoaderHttpServiceMechanismFactories.reset.name),
    );
  });

  it("Edit module", () => {
    cy.navigateTo(managementEndpoint, "elytron-factories-transformers");
    cy.get("#http-factories-item").click();
    cy.get("#elytron-service-loader-http-server-mechanism-factory-item").click();
    cy.selectInTable(
      serviceLoaderHttpServerMechanismFactoryTableId,
      serviceLoaderHttpServiceMechanismFactories.update.name,
    );
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "module", "sample");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      address.concat(serviceLoaderHttpServiceMechanismFactories.update.name),
      "module",
      "sample",
    );
  });
});
