describe("TESTS: Configuration => Subsystem => Batch => In Memory", () => {
  const batchInMemoryTableId = "batch-in-memory-job-repo-table";

  const inMemoryJobRepositories = {
    create: {
      name: "in-memory-job-repository-create",
    },
    remove: {
      name: "in-memory-job-repository-remove",
    },
  };

  let managementEndpoint: string;

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Create In Memory Job Repository", () => {
    cy.navigateTo(managementEndpoint, "batch-jberet-configuration");
    cy.get("#batch-in-memory-job-repo-item").click();
    cy.addInTable(batchInMemoryTableId);
    cy.text(
      "batch-in-memory-job-repo-table-add",
      "name",
      inMemoryJobRepositories.create.name
    );
    cy.get(
      'div.modal-footer > button.btn.btn-hal.btn-primary:contains("Add")'
    ).click();
    cy.verifySuccess();
    cy.validateAddress(
      managementEndpoint,
      [
        "subsystem",
        "batch-jberet",
        "in-memory-job-repository",
        inMemoryJobRepositories.create.name,
      ],
      true
    );
  });

  it("Remove In Memory Job Repository", () => {
    cy.addAddress(managementEndpoint, [
      "subsystem",
      "batch-jberet",
      "in-memory-job-repository",
      inMemoryJobRepositories.remove.name,
    ]);
    cy.navigateTo(managementEndpoint, "batch-jberet-configuration");
    cy.get("#batch-in-memory-job-repo-item").click();
    cy.removeFromTable(
      batchInMemoryTableId,
      inMemoryJobRepositories.remove.name
    );
    cy.verifySuccess();
    cy.validateAddress(
      managementEndpoint,
      [
        "subsystem",
        "batch-jberet",
        "in-memory-job-repository",
        inMemoryJobRepositories.remove.name,
      ],
      false
    );
  });
});
