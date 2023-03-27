describe("TESTS: Configuration => Subsystem => EJB => Bean Pool", () => {
  let managementEndpoint: string;

  const address = ["subsystem", "ejb3", "strict-max-bean-instance-pool"];
  const beanPoolTableId = "ejb3-bean-pool-table";
  const configurationFormId = "ejb3-bean-pool-form";

  const beanPools = {
    create: {
      name: "bp-to-create",
    },
    update: {
      name: "bp-to-update",
    },
    remove: {
      name: "bp-to-remove",
    },
    reset: {
      name: "bp-to-reset",
    },
  };

  before(() => {
    cy.startWildflyContainer()
      .then((result) => {
        managementEndpoint = result as string;
      })
      .then(() => {
        cy.addAddress(managementEndpoint, address.concat(beanPools.update.name), {
          "max-threads": 10,
        });
        cy.addAddress(managementEndpoint, address.concat(beanPools.remove.name), {
          "max-threads": 10,
        });
        cy.addAddress(managementEndpoint, address.concat(beanPools.reset.name), {
          "max-threads": 10,
        });
      });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Create Bean Pool", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-bean-pool-item").click();
    cy.addInTable(beanPoolTableId);
    cy.text("ejb3-bean-pool-table-add", "name", beanPools.create.name);
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.validateAddress(managementEndpoint, address.concat(beanPools.create.name), true);
  });

  it("Edit derive-size", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-bean-pool-item").click();
    cy.selectInTable(beanPoolTableId, beanPools.update.name);
    cy.editForm(configurationFormId);
    cy.formInput(configurationFormId, "derive-size").select("from-cpu-count", {
      force: true,
    });
    cy.formInput(configurationFormId, "derive-size").trigger("change", {
      force: true,
    });
    cy.formInput(configurationFormId, "derive-size").should("have.value", "from-cpu-count");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address.concat(beanPools.update.name), "derive-size", "from-cpu-count");
  });

  it("Edit max-pool-size", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-bean-pool-item").click();
    cy.selectInTable(beanPoolTableId, beanPools.update.name);
    cy.editForm(configurationFormId);
    cy.formInput(configurationFormId, "derive-size").select("", {
      force: true,
    });
    cy.formInput(configurationFormId, "derive-size").trigger("change", {
      force: true,
    });
    cy.formInput(configurationFormId, "derive-size").should("have.value", "");
    cy.text(configurationFormId, "max-pool-size", "8");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address.concat(beanPools.update.name), "max-pool-size", 8);
  });

  it("Edit timeout", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-bean-pool-item").click();
    cy.selectInTable(beanPoolTableId, beanPools.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "timeout", "8");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address.concat(beanPools.update.name), "timeout", 8);
  });

  it("Edit timeout-unit", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-bean-pool-item").click();
    cy.selectInTable(beanPoolTableId, beanPools.update.name);
    cy.editForm(configurationFormId);
    cy.formInput(configurationFormId, "timeout-unit").select("SECONDS", {
      force: true,
    });
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address.concat(beanPools.update.name), "timeout-unit", "SECONDS");
  });

  it("Remove", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-bean-pool-item").click();
    cy.removeFromTable(beanPoolTableId, beanPools.remove.name);
    cy.verifySuccess();
    cy.validateAddress(managementEndpoint, address.concat(beanPools.remove.name), false);
  });

  it("Reset", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-bean-pool-item").click();
    cy.selectInTable(beanPoolTableId, beanPools.reset.name);
    cy.resetForm(configurationFormId, managementEndpoint, address.concat(beanPools.reset.name));
  });
});
