describe("TESTS: Configuration => Subsystems => IO => Worker", () => {
  const address = ["subsystem", "io", "worker", "my-io-worker"];

  const workerForm = {
    idNew: "io-worker-table-add",
    idUpdate: "io-worker-form",
    name: "name",
    ioThreads: "io-threads",
    stackSize: "stack-size",
    taskCoreThreads: "task-core-threads",
    taskKeepalive: "task-keepalive",
    taskMaxThreads: "task-max-threads",
    outboundBindAddress: "outbound-bind-address",
  };

  const testDefaultValues = {
    name: "my-io-worker",
    ioThreads: 10,
    stackSize: 11,
    taskCoreThreads: 12,
    taskKeepalive: 10000,
    taskMaxThreads: 13,
  };

  const testNewValues = {
    ioWorkerName: "my-io-worker",
    ioThreads: 20,
    stackSize: 21,
    taskCoreThreads: 22,
    taskKeepalive: 20000,
    taskMaxThreads: 23,
  };

  const itemSelectors = {
    ioWorkerItem: "#io-worker-item a",
    ioWorkersTableId: "io-worker-table",
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

  beforeEach(() => {
    cy.navigateTo(managementEndpoint, "io");
    cy.get(itemSelectors.ioWorkerItem).click();
  });

  it("Create custom io-worker", () => {
    cy.navigateTo(managementEndpoint, "io");
    cy.addInTable(itemSelectors.ioWorkersTableId);
    cy.text(workerForm.idNew, workerForm.name, testDefaultValues.name);
    cy.text(
      workerForm.idNew,
      workerForm.ioThreads,
      testDefaultValues.ioThreads
    );
    cy.text(
      workerForm.idNew,
      workerForm.stackSize,
      testDefaultValues.stackSize
    );
    cy.text(
      workerForm.idNew,
      workerForm.taskKeepalive,
      testDefaultValues.taskKeepalive
    );
    cy.text(
      workerForm.idNew,
      workerForm.taskMaxThreads,
      testDefaultValues.taskMaxThreads
    );
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      address,
      workerForm.ioThreads,
      testDefaultValues.ioThreads
    );
    cy.verifyAttribute(
      managementEndpoint,
      address,
      workerForm.stackSize,
      testDefaultValues.stackSize
    );
    cy.verifyAttribute(
      managementEndpoint,
      address,
      workerForm.taskKeepalive,
      testDefaultValues.taskKeepalive
    );
    cy.verifyAttribute(
      managementEndpoint,
      address,
      workerForm.taskMaxThreads,
      testDefaultValues.taskMaxThreads
    );
  });

  it("Edit io-threads", () => {
    cy.selectInTable(itemSelectors.ioWorkersTableId, testDefaultValues.name);
    cy.editForm(workerForm.idUpdate);
    cy.text(workerForm.idUpdate, workerForm.ioThreads, testNewValues.ioThreads);
    cy.saveForm(workerForm.idUpdate);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      address,
      workerForm.ioThreads,
      testNewValues.ioThreads
    );
  });

  it("Edit stack-size", () => {
    cy.selectInTable(itemSelectors.ioWorkersTableId, testDefaultValues.name);
    cy.editForm(workerForm.idUpdate);
    cy.text(workerForm.idUpdate, workerForm.stackSize, testNewValues.stackSize);
    cy.saveForm(workerForm.idUpdate);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      address,
      workerForm.stackSize,
      testNewValues.stackSize
    );
  });

  it("Edit keep-alive", () => {
    cy.selectInTable(itemSelectors.ioWorkersTableId, testDefaultValues.name);
    cy.editForm(workerForm.idUpdate);
    cy.text(
      workerForm.idUpdate,
      workerForm.taskKeepalive,
      testNewValues.taskKeepalive
    );
    cy.saveForm(workerForm.idUpdate);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      address,
      workerForm.taskKeepalive,
      testNewValues.taskKeepalive
    );
  });

  it("Edit max-threads", () => {
    cy.selectInTable(itemSelectors.ioWorkersTableId, testDefaultValues.name);
    cy.editForm(workerForm.idUpdate);
    cy.text(
      workerForm.idUpdate,
      workerForm.taskMaxThreads,
      testNewValues.taskMaxThreads
    );
    cy.saveForm(workerForm.idUpdate);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      address,
      workerForm.taskMaxThreads,
      testNewValues.taskMaxThreads
    );
  });

  it("Remove custom io-worker", () => {
    cy.removeFromTable(itemSelectors.ioWorkersTableId, testDefaultValues.name);
    cy.verifySuccess();
    cy.verifyRemovedFromTable(
      itemSelectors.ioWorkersTableId,
      testDefaultValues.name
    );
  });
});
