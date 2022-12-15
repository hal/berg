describe("TESTS: Configuration => Subsystem => Batch => Configuration", () => {
  const configurationFormId = "batch-configuration-form";
  const restartJobsOnResume = "restart-jobs-on-resume";
  const defaultJobRepository = "default-job-repository";
  let managementEndpoint: string;

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Toggle restart-jobs-on-resume", () => {
    let value = false;
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: ["subsystem", "batch-jberet"],
      name: restartJobsOnResume,
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "batch-jberet-configuration");
      cy.get("#batch-configuration-item").click();
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, restartJobsOnResume, value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(
        managementEndpoint,
        ["subsystem", "batch-jberet"],
        restartJobsOnResume,
        !value
      );
    });
  });

  it("Edit default-job-repository", () => {
    const jobRepository = "some-other-value";
    cy.addAddress(managementEndpoint, [
      "subsystem",
      "batch-jberet",
      "in-memory-job-repository",
      jobRepository,
    ]);
    cy.navigateTo(managementEndpoint, "batch-jberet-configuration");
    cy.get("#batch-configuration-item").click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, defaultJobRepository, jobRepository);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      ["subsystem", "batch-jberet"],
      "default-job-repository",
      jobRepository
    );
  });
});
