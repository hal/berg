// navigation crumbs in the management console
describe("TESTS: Configuration => Sybsystem => Transaction => Recovery", () => {
  const transactions = "transactions";
  const address = ["subsystem", transactions];
  const recoveryTab = "#tx-recovery-config-item";
  const recoveryForm = "tx-recovery-form";
  const socketBinding = "socket-binding";
  const statusSocketBinding = "status-socket-binding";
  const recoveryListener = "recovery-listener";

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

  it("Edit Socket Binding", () => {
    cy.navigateTo(managementEndpoint, transactions);
    cy.get(recoveryTab).click();
    cy.editForm(recoveryForm);
    cy.text(recoveryForm, socketBinding, "updated-socket-binding");
    cy.saveForm(recoveryForm);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, socketBinding, "updated-socket-binding");
  });

  it("Edit Status Socket Binding", () => {
    cy.navigateTo(managementEndpoint, transactions);
    cy.get(recoveryTab).click();
    cy.editForm(recoveryForm);
    cy.text(recoveryForm, statusSocketBinding, "updated-status-socket-binding");
    cy.saveForm(recoveryForm);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, statusSocketBinding, "updated-status-socket-binding");
  });

  it("Toggle Recovery Listener", () => {
    cy.readAttributeAsBoolean(managementEndpoint, address, recoveryListener).then((defaultValue: boolean) => {
      cy.navigateTo(managementEndpoint, transactions);
      cy.get(recoveryTab).click();
      cy.editForm(recoveryForm);
      cy.flip(recoveryForm, recoveryListener, defaultValue);
      cy.saveForm(recoveryForm);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address, recoveryListener, !defaultValue);
    });
  });
});
