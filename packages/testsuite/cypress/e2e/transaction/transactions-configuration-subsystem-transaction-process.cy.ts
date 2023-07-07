// navigation crumbs in the management console
describe("TESTS: Configuration => Sybsystem => Transaction => Process", () => {
  const transactions = "transactions";
  const address = ["subsystem", transactions];
  const processTab = "#tx-process-item";
  const processForm = "tx-process-form";
  const processIdUuid = "process-id-uuid";
  const processIdSocektBinding = "process-id-socket-binding";
  const processIdSocketMaxPorts = "process-id-socket-max-ports";

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

  it("Toggle Process ID UUID", () => {
    cy.readAttributeAsBoolean(managementEndpoint, address, processIdUuid).then((defaultValue: boolean) => {
      cy.navigateTo(managementEndpoint, transactions);
      cy.get(processTab).click();
      cy.editForm(processForm);

      //process-id-socket-binding must be set if the process-id-uuid is set to false and must be undefined otherweise
      if (defaultValue) {
        cy.text(processForm, processIdSocektBinding, "non-empty");
      } else {
        cy.text(processForm, processIdSocektBinding, "");
      }

      cy.flip(processForm, processIdUuid, defaultValue);
      cy.saveForm(processForm);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address, processIdUuid, !defaultValue);
    });
  });

  it("Edit Process ID Socket Binding", () => {
    cy.readAttributeAsBoolean(managementEndpoint, address, processIdUuid).then((pidUUIDvalue: boolean) => {
      cy.navigateTo(managementEndpoint, transactions);
      cy.get(processTab).click();
      cy.editForm(processForm);

      //process-id-uuid must be false while process-id-socekt-binding is being set
      if (pidUUIDvalue) {
        cy.flip(processForm, processIdUuid, pidUUIDvalue);
      }
      cy.text(processForm, processIdSocektBinding, "updated-process-binding");
      cy.saveForm(processForm);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address, processIdSocektBinding, "updated-process-binding");
    });
  });

  it("Edit Process ID Socket Max Ports", () => {
    cy.readAttributeAsBoolean(managementEndpoint, address, processIdUuid).then((pidUUIDvalue: boolean) => {
      cy.navigateTo(managementEndpoint, transactions);
      cy.get(processTab).click();
      cy.editForm(processForm);

      // process-id-socket-max-ports can be set only with conmbination of process-id-socket-binding
      if (pidUUIDvalue) {
        cy.flip(processForm, processIdUuid, pidUUIDvalue);
        cy.text(processForm, processIdSocektBinding, "updated-process-binding");
      }

      cy.text(processForm, processIdSocketMaxPorts, 42);
      cy.saveForm(processForm);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address, processIdSocketMaxPorts, 42);
    });
  });
});
