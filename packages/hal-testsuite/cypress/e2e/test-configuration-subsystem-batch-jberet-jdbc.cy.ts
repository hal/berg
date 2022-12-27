describe("TESTS: Configuration => Subsystem => Batch => JDBC", () => {
  const batchJdbcRepositoryTableId = "batch-jdbc-job-repo-table";

  const jdbcJobRepositories = {
    create: {
      name: "jdbc-job-repository-create",
      dataSource: "ExampleDS",
    },
    remove: {
      name: "jdbc-job-repository-remove",
      dataSource: "ExampleDS",
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

  it("Create JDBC Job Repository", () => {
    cy.navigateTo(managementEndpoint, "batch-jberet-configuration");
    cy.get("#batch-jdbc-job-repo-item").click();
    cy.addInTable(batchJdbcRepositoryTableId);
    cy.text(
      "batch-jdbc-job-repo-table-add",
      "name",
      jdbcJobRepositories.create.name
    );
    cy.text(
      "batch-jdbc-job-repo-table-add",
      "data-source",
      jdbcJobRepositories.create.dataSource
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
        "jdbc-job-repository",
        jdbcJobRepositories.create.name,
      ],
      true
    );
  });

  it("Remove JDBC Job Repository", () => {
    cy.addAddress(
      managementEndpoint,
      [
        "subsystem",
        "batch-jberet",
        "jdbc-job-repository",
        jdbcJobRepositories.remove.name,
      ],
      { "data-source": jdbcJobRepositories.remove.dataSource }
    );
    cy.navigateTo(managementEndpoint, "batch-jberet-configuration");
    cy.get("#batch-jdbc-job-repo-item").click();
    cy.removeFromTable(
      batchJdbcRepositoryTableId,
      jdbcJobRepositories.remove.name
    );
    cy.verifySuccess();
    cy.validateAddress(
      managementEndpoint,
      [
        "subsystem",
        "batch-jberet",
        "jdbc-job-repository",
        jdbcJobRepositories.remove.name,
      ],
      false
    );
  });
});
