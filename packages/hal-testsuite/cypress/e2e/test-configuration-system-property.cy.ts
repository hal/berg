describe("TESTS: Configuration => System Properties", () => {
  const configurationFormId = "system-property-form";

  const value = "value";

  const systemPropertyToCreate = {
    name: "toCreate",
    value: "creating-values",
  };
  const systemPropertyToDelete = {
    name: "toDelete",
    value: "deleting-values",
  };
  const systemPropertyToRead = {
    name: "toRead",
    value: "reading-values",
  };
  const systemPropertyToUpdate = {
    name: "toUpdate",
    value: "updating-values",
  };
  let managementEndpoint: string;

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
      cy.addAddress(
        managementEndpoint,
        ["system-property", systemPropertyToRead.name],
        { value: systemPropertyToRead.value }
      );
      cy.addAddress(
        managementEndpoint,
        ["system-property", systemPropertyToUpdate.name],
        { value: systemPropertyToUpdate.value }
      );
      cy.addAddress(
        managementEndpoint,
        ["system-property", systemPropertyToDelete.name],
        { value: systemPropertyToDelete.value }
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
    cy.get('button.btn.btn-default > span:contains("Add")').click();
    cy.get("input#system-property-add-name-editing")
      .click()
      .clear()
      .type(systemPropertyToCreate.name)
      .should("have.value", systemPropertyToCreate.name)
      .trigger("change");
    cy.get("input#system-property-add-value-editing")
      .click()
      .clear()
      .type(systemPropertyToCreate.value)
      .should("have.value", systemPropertyToCreate.value)
      .trigger("change");
    cy.get(
      'div.modal-footer > button.btn.btn-hal.btn-primary:contains("Add")'
    ).click();
    cy.verifySuccess();
    cy.validateAddress(
      managementEndpoint,
      ["system-property", systemPropertyToCreate.name],
      true
    );
  });

  it("Delete System Property", () => {
    cy.validateAddress(
      managementEndpoint,
      ["system-property", systemPropertyToDelete.name],
      true
    );
    cy.get(
      'table#system-property-table td:contains("' +
        systemPropertyToDelete.name +
        '")'
    ).click();
    cy.get('button.btn.btn-default > span:contains("Remove")').click();
    cy.get(
      'div.modal-footer > button.btn.btn-hal.btn-primary:contains("Yes")'
    ).click();
    cy.verifySuccess();
    cy.validateAddress(
      managementEndpoint,
      ["system-property", systemPropertyToDelete.name],
      false
    );
  });

  it("Read System Property", () => {
    cy.get(
      'table#system-property-table td:contains("' +
        systemPropertyToRead.name +
        '")'
    ).click();
    cy.get("table#system-property-table tr.selected")
      .children("td")
      .should("include.text", systemPropertyToRead.value);
  });

  it("Update System Property", () => {
    cy.get(
      'table#system-property-table td:contains("' +
        systemPropertyToUpdate.name +
        '")'
    ).click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, value, "newValue");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      ["system-property", systemPropertyToUpdate.name],
      value,
      "newValue"
    );
  });
});
