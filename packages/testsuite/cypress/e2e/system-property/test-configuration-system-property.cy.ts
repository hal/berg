describe("TESTS: Configuration => System Properties", () => {
  const systemPropertyTableId = "system-property-table";
  const configurationFormId = "system-property-form";

  const value = "value";

  const systemProperties = {
    create: {
      name: "toCreate",
      value: "creating-values",
    },
    delete: {
      name: "toDelete",
      value: "deleting-values",
    },
    read: {
      name: "toRead",
      value: "reading-values",
    },
    update: {
      name: "toUpdate",
      value: "updating-values",
    },
    reset: {
      name: "toReset",
      value: "resetting-values",
    },
  };

  let managementEndpoint: string;

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
      cy.addAddress(
        managementEndpoint,
        ["system-property", systemProperties.update.name],
        { value: systemProperties.update.value }
      );
      cy.addAddress(
        managementEndpoint,
        ["system-property", systemProperties.delete.name],
        { value: systemProperties.delete.value }
      );
      cy.addAddress(
        managementEndpoint,
        ["system-property", systemProperties.read.name],
        { value: systemProperties.read.value }
      );
      cy.addAddress(
        managementEndpoint,
        ["system-property", systemProperties.reset.name],
        { value: systemProperties.reset.value }
      );
    });
  });

  beforeEach(() => {
    cy.navigateTo(managementEndpoint, "system-properties");
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Create System Property", () => {
    cy.addInTable(systemPropertyTableId);
    cy.text("system-property-add", "name", systemProperties.create.name);
    cy.text("system-property-add", value, systemProperties.create.value);
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.validateAddress(
      managementEndpoint,
      ["system-property", systemProperties.create.name],
      true
    );
  });

  it("Delete System Property", () => {
    cy.validateAddress(
      managementEndpoint,
      ["system-property", systemProperties.delete.name],
      true
    );
    cy.removeFromTable(systemPropertyTableId, systemProperties.delete.name);
    cy.verifySuccess();
    cy.validateAddress(
      managementEndpoint,
      ["system-property", systemProperties.delete.name],
      false
    );
  });

  it("Read System Property", () => {
    cy.selectInTable(systemPropertyTableId, systemProperties.read.name);
    cy.get("table#system-property-table tr.selected")
      .children("td")
      .should("include.text", systemProperties.read.value);
  });

  it("Update System Property", () => {
    cy.selectInTable(systemPropertyTableId, systemProperties.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, value, "newValue");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      ["system-property", systemProperties.update.name],
      value,
      "newValue"
    );
  });

  it("Reset System Property", () => {
    cy.selectInTable(systemPropertyTableId, systemProperties.reset.name);
    cy.resetForm(configurationFormId, managementEndpoint, [
      "system-property",
      systemProperties.reset.name,
    ]);
  });
});
