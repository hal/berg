describe("TESTS: Configuration => Subsystem => Batch => Thread Factory", () => {
  const configurationFormId = "batch-thread-factory-form";
  const priority = "priority";
  const groupName = "group-name";
  const threadNamePattern = "thread-name-pattern";

  const threadFactories = {
    create: {
      name: "thread-factory-create",
    },
    remove: {
      name: "thread-factory-remove",
    },
    edit: {
      name: "thread-factory-edit",
    },
  };

  let managementEndpoint: string;

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
      cy.addAddress(managementEndpoint, [
        "subsystem",
        "batch-jberet",
        "thread-factory",
        threadFactories.edit.name,
      ]);
      cy.addAddress(managementEndpoint, [
        "subsystem",
        "batch-jberet",
        "thread-factory",
        threadFactories.remove.name,
      ]);
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Create Thread Factory", () => {
    cy.navigateTo(managementEndpoint, "batch-jberet-configuration");
    cy.get("#batch-thread-factory-item").click();
    cy.get(
      '#batch-thread-factory-table_wrapper button.btn.btn-default > span:contains("Add")'
    ).click();
    cy.get("input#batch-thread-factory-table-add-name-editing")
      .click()
      .type(threadFactories.create.name)
      .should("have.value", threadFactories.create.name)
      .trigger("change");
    cy.get(
      'div.modal-footer > button.btn.btn-hal.btn-primary:contains("Add")'
    ).click();
    cy.verifySuccess();
    cy.validateAddress(
      managementEndpoint,
      [
        "subsystem",
        "batch-jberet",
        "thread-factory",
        threadFactories.create.name,
      ],
      true
    );
  });

  it("Remove Thread Factory", () => {
    cy.navigateTo(managementEndpoint, "batch-jberet-configuration");
    cy.get("#batch-thread-factory-item").click();
    cy.get(
      'table#batch-thread-factory-table td:contains("' +
        threadFactories.remove.name +
        '")'
    ).click();
    cy.get(
      '#batch-thread-factory-table_wrapper button.btn.btn-default > span:contains("Remove")'
    ).click();
    cy.get(
      'div.modal-footer > button.btn.btn-hal.btn-primary:contains("Yes")'
    ).click();
    cy.verifySuccess();
    cy.validateAddress(
      managementEndpoint,
      [
        "subsystem",
        "batch-jberet",
        "thread-factory",
        threadFactories.remove.name,
      ],
      false
    );
  });

  it("Edit group-name", () => {
    cy.navigateTo(managementEndpoint, "batch-jberet-configuration");
    cy.get("#batch-thread-factory-item").click();
    cy.get(
      'table#batch-thread-factory-table td:contains("' +
        threadFactories.edit.name +
        '")'
    ).click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, groupName, "newValue");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      [
        "subsystem",
        "batch-jberet",
        "thread-factory",
        threadFactories.edit.name,
      ],
      groupName,
      "newValue"
    );
  });

  it("Edit priority", () => {
    cy.navigateTo(managementEndpoint, "batch-jberet-configuration");
    cy.get("#batch-thread-factory-item").click();
    cy.get(
      'table#batch-thread-factory-table td:contains("' +
        threadFactories.edit.name +
        '")'
    ).click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, priority, "10");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      [
        "subsystem",
        "batch-jberet",
        "thread-factory",
        threadFactories.edit.name,
      ],
      priority,
      10
    );
  });

  it("Edit thread-name-pattern", () => {
    cy.navigateTo(managementEndpoint, "batch-jberet-configuration");
    cy.get("#batch-thread-factory-item").click();
    cy.get(
      'table#batch-thread-factory-table td:contains("' +
        threadFactories.edit.name +
        '")'
    ).click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, threadNamePattern, "newValue");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      [
        "subsystem",
        "batch-jberet",
        "thread-factory",
        threadFactories.edit.name,
      ],
      threadNamePattern,
      "newValue"
    );
  });

  it("Reset Thread Factory", () => {
    cy.navigateTo(managementEndpoint, "batch-jberet-configuration");
    cy.get("#batch-thread-factory-item").click();
    cy.get(
      'table#batch-thread-factory-table td:contains("' +
        threadFactories.edit.name +
        '")'
    ).click();
    cy.resetForm(configurationFormId, managementEndpoint + "/management", [
      "subsystem",
      "batch-jberet",
      "thread-factory",
      threadFactories.edit.name,
    ]);
  });
});
