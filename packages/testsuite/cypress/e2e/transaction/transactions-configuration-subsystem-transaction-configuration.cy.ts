// navigation crumbs in the management console
describe("TESTS: Configuration => Sybsystem => Transaction => Configuration", () => {
  const transactions = "transactions";
  const address = ["subsystem", transactions];
  const configTab = "#tx-attributes-config-item";
  const configurationForm = "tx-attributes-form";
  const defaultTimeout = "default-timeout";
  const enableTsmStatus = "enable-tsm-status";
  const journalStoreEnableAIO = "journal-store-enable-async-io";
  const jts = "jts";
  const maximumTimeout = "maximum-timeout";
  const nodeIdentifier = "node-identifier";
  const statisticsEnabled = "statistics-enabled";
  const useJurnalStore = "use-journal-store";

  let managementEndpoint: string;

  // Here we start our WildFly container prior to test execution
  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Edit Default Timeout", () => {
    cy.readAttributeAsNumber(managementEndpoint, address, defaultTimeout).then((defaultValue: number) => {
      const newValue = defaultValue + 42;
      cy.navigateTo(managementEndpoint, transactions);
      cy.get(configTab).click();
      cy.editForm(configurationForm);
      cy.text(configurationForm, defaultTimeout, newValue);
      cy.saveForm(configurationForm);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address, defaultTimeout, newValue);
    });
  });

  it("Toggle Enable Tsm Status", () => {
    cy.readAttributeAsBoolean(managementEndpoint, address, enableTsmStatus).then((defaultValue: boolean) => {
      cy.navigateTo(managementEndpoint, transactions);
      cy.get(configTab).click();
      cy.editForm(configurationForm);
      cy.flip(configurationForm, enableTsmStatus, defaultValue);
      cy.saveForm(configurationForm);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address, enableTsmStatus, !defaultValue);
    });
  });

  it("Toggle Journal Store Enable Async IO", () => {
    cy.writeAttrubute(managementEndpoint, address, useJurnalStore, true);
    cy.readAttributeAsBoolean(managementEndpoint, address, journalStoreEnableAIO).then((defaultValue: boolean) => {
      cy.navigateTo(managementEndpoint, transactions);
      cy.get(configTab).click();
      cy.editForm(configurationForm);
      cy.flip(configurationForm, journalStoreEnableAIO, defaultValue);
      cy.saveForm(configurationForm);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address, journalStoreEnableAIO, !defaultValue);
    });
  });

  it("Toggle JTS", () => {
    cy.readAttributeAsBoolean(managementEndpoint, address, jts).then((defaultValue: boolean) => {
      cy.navigateTo(managementEndpoint, transactions);
      cy.get(configTab).click();
      cy.editForm(configurationForm);
      cy.flip(configurationForm, jts, defaultValue);
      cy.saveForm(configurationForm);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address, jts, !defaultValue);
    });
  });

  it("Edit Maximum Timeout", () => {
    cy.readAttributeAsNumber(managementEndpoint, address, maximumTimeout).then((defaultValue: number) => {
      const newValue = defaultValue + 100;
      cy.navigateTo(managementEndpoint, transactions);
      cy.get(configTab).click();
      cy.editForm(configurationForm);
      cy.text(configurationForm, maximumTimeout, newValue);
      cy.saveForm(configurationForm);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address, maximumTimeout, newValue);
    });
  });

  it("Edit Node Identifier", () => {
    cy.navigateTo(managementEndpoint, transactions);
    cy.get(configTab).click();
    cy.editForm(configurationForm);
    cy.text(configurationForm, nodeIdentifier, "updated-node-identifier");
    cy.saveForm(configurationForm);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, nodeIdentifier, "updated-node-identifier");
  });

  it("Toggle Statistics enabled", () => {
    cy.navigateTo(managementEndpoint, transactions);
    cy.get(configTab).click();
    cy.editForm(configurationForm);
    cy.get("[data-form-item-group='tx-attributes-form-statistics-enabled-editing']")
      .find(".expression-mode-switcher")
      .filter("[title='Switch to normal mode']")
      .click();
    cy.flip(configurationForm, statisticsEnabled, false);
    cy.saveForm(configurationForm);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, statisticsEnabled, true);
  });

  it("Toggle Use Jurnal Store", () => {
    cy.writeAttrubute(managementEndpoint, address, journalStoreEnableAIO, false);
    cy.readAttributeAsBoolean(managementEndpoint, address, useJurnalStore).then((defaultValue: boolean) => {
      cy.navigateTo(managementEndpoint, transactions);
      cy.get(configTab).click();
      cy.editForm(configurationForm);
      cy.flip(configurationForm, useJurnalStore, defaultValue);
      cy.saveForm(configurationForm);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address, useJurnalStore, !defaultValue);
    });
  });
});
