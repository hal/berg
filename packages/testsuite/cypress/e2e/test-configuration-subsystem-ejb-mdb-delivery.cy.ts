describe("TESTS: Configuration => Subsystem => EJB => MDB Delivery", () => {
  let managementEndpoint: string;

  const address = ["subsystem", "ejb3", "mdb-delivery-group"];
  const mdbDeliveryGroupTableId = "ejb3-mdb-delivery-group-table";
  const configurationFormId = "ejb3-mdb-delivery-group-form";

  const mdbDeliveryGroups = {
    create: {
      name: "mdb-dg-to-create",
    },
    update: {
      name: "mdb-dg-to-update",
    },
    reset: {
      name: "mdb-dg-to-reset",
    },
    remove: {
      name: "mdb-dg-to-remove",
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
          address.concat(mdbDeliveryGroups.update.name)
        );
        cy.addAddress(
          managementEndpoint,
          address.concat(mdbDeliveryGroups.reset.name)
        );
        cy.addAddress(
          managementEndpoint,
          address.concat(mdbDeliveryGroups.remove.name)
        );
      });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Create MDB Delivery Group", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-mdb-delivery-group-item").click();
    cy.addInTable(mdbDeliveryGroupTableId);
    cy.text(
      "ejb3-mdb-delivery-group-table-add",
      "name",
      mdbDeliveryGroups.create.name
    );
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.validateAddress(
      managementEndpoint,
      address.concat(mdbDeliveryGroups.create.name),
      true
    );
  });

  it("Toggle active", () => {
    let value = false;
    cy.addAddressIfDoesntExist(managementEndpoint, address);
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: address.concat(mdbDeliveryGroups.update.name),
      name: "active",
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "ejb3-configuration");
      cy.get("#ejb3-mdb-delivery-group-item").click();
      cy.selectInTable(mdbDeliveryGroupTableId, mdbDeliveryGroups.update.name);
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, "active", value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(
        managementEndpoint,
        address.concat(mdbDeliveryGroups.update.name),
        "active",
        !value
      );
    });
  });

  it("Reset", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-mdb-delivery-group-item").click();
    cy.selectInTable(mdbDeliveryGroupTableId, mdbDeliveryGroups.reset.name);
    cy.resetForm(
      configurationFormId,
      managementEndpoint,
      address.concat(mdbDeliveryGroups.reset.name)
    );
  });

  it("Remove", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-mdb-delivery-group-item").click();
    cy.removeFromTable(mdbDeliveryGroupTableId, mdbDeliveryGroups.remove.name);
    cy.verifySuccess();
    cy.validateAddress(
      managementEndpoint,
      address.concat(mdbDeliveryGroups.remove.name),
      false
    );
  });
});
