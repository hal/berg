describe("TESTS: Configuration => Subsystems => IO => Buffer Pool", () => {
  const address = ["subsystem", "io", "buffer-pool", "my-buffer-pool"];

  const bufferPoolForm = {
    idNew: "io-buffer-pool-table-add",
    idUpdate: "io-buffer-pool-form",
    name: "name",
    bufferSize: "buffer-size",
    buffersPerSlice: "buffers-per-slice",
    directBuffers: "direct-buffers",
  };

  const testDefaultValues = {
    name: "my-buffer-pool",
    bufferSize: 10,
    buffersPerSlice: 11,
    directBuffers: false,
  };

  const testNewValues = {
    name: "my-buffer-pool",
    bufferSize: 20,
    buffersPerSlice: 21,
    direct: true,
  };

  const itemSelectors = {
    ioBufferPoolItem: "#io-buffer-pool-item a",
    ioBufferPoolTableId: "io-buffer-pool-table",
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
    cy.get(itemSelectors.ioBufferPoolItem).click();
  });

  it("Create custom buffer-pool", () => {
    cy.navigateTo(managementEndpoint, "io");
    cy.addInTable(itemSelectors.ioBufferPoolTableId);
    cy.text(bufferPoolForm.idNew, bufferPoolForm.name, testDefaultValues.name);
    cy.text(bufferPoolForm.idNew, bufferPoolForm.bufferSize, testDefaultValues.bufferSize);
    cy.text(bufferPoolForm.idNew, bufferPoolForm.buffersPerSlice, testDefaultValues.buffersPerSlice);
    cy.flip(bufferPoolForm.idNew, bufferPoolForm.directBuffers, testDefaultValues.directBuffers);
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, bufferPoolForm.bufferSize, testDefaultValues.bufferSize);
    cy.verifyAttribute(managementEndpoint, address, bufferPoolForm.buffersPerSlice, testDefaultValues.buffersPerSlice);
    cy.verifyAttribute(managementEndpoint, address, bufferPoolForm.directBuffers, !testDefaultValues.directBuffers);
  });

  it("Edit buffer-size", () => {
    cy.selectInTable(itemSelectors.ioBufferPoolTableId, testDefaultValues.name);
    cy.editForm(bufferPoolForm.idUpdate);
    cy.text(bufferPoolForm.idUpdate, bufferPoolForm.bufferSize, testNewValues.bufferSize);
    cy.saveForm(bufferPoolForm.idUpdate);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, bufferPoolForm.bufferSize, testNewValues.bufferSize);
  });

  it("Edit buffers-per-slice", () => {
    cy.selectInTable(itemSelectors.ioBufferPoolTableId, testDefaultValues.name);
    cy.editForm(bufferPoolForm.idUpdate);
    cy.text(bufferPoolForm.idUpdate, bufferPoolForm.buffersPerSlice, testNewValues.buffersPerSlice);
    cy.saveForm(bufferPoolForm.idUpdate);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, bufferPoolForm.buffersPerSlice, testNewValues.buffersPerSlice);
  });

  it("Toggle direct-buffers", () => {
    cy.readAttributeAsBoolean(managementEndpoint, address, bufferPoolForm.directBuffers).then(
      (defaultValue: boolean) => {
        cy.selectInTable(itemSelectors.ioBufferPoolTableId, testDefaultValues.name);
        cy.editForm(bufferPoolForm.idUpdate);
        cy.flip(bufferPoolForm.idUpdate, bufferPoolForm.directBuffers, defaultValue);
        cy.saveForm(bufferPoolForm.idUpdate);
        cy.verifySuccess();
        cy.verifyAttribute(managementEndpoint, address, bufferPoolForm.directBuffers, !defaultValue);
      },
    );
  });

  it("Remove buffer-pool", () => {
    cy.removeFromTable(itemSelectors.ioBufferPoolTableId, testDefaultValues.name);
    cy.verifySuccess();
    cy.verifyRemovedFromTable(itemSelectors.ioBufferPoolTableId, testDefaultValues.name);
  });
});
