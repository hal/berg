describe("TESTS: Configuration => Subsystems => Mail => Server", () => {
  const address = [
    "subsystem",
    "mail",
    "mail-session",
    "my-mail-session",
    "server",
    "smtp",
  ];

  const outBoundSocketBinding = {
    name: "custom-outbound-socket-binding",
    host: "localhost",
    port: "15099",
  };

  const addServerForm = {
    id: "mail-server-add-form",
    typeSelector: "#mail-server-add-form-server-type-editing",
    outboundSocket: "outbound-socket-binding-ref",
  };

  const credentialsReferenceForm = {
    id: "mail-server-credential-reference-add",
    clearTextCliName: "credential-reference.clear-text",
    clearText: "clear-text",
  };

  const testValues = {
    mailSessionName: "my-mail-session",
    jndiName: "java:jboss/mail/MyJNDI",
    clearText: "ClearTextValue",
    serverType: "SMTP",
  };

  const mailSessionTable = {
    id: "mail-server-table",
    outboundSocketType: "SMTP",
  };

  const itemSelectors = {
    mailServerItem: "#mail-server-item a",
    mailServerAdd:
      "div.pull-right.btn-group.hal-table-buttons > button:contains('Add')",
    buttonAdd:
      "div.modal-footer > button.btn.btn-hal.btn-primary:contains('Add')",
    credentialsReferenceTab: "a:contains('Credential Reference')",
    credentialsReferenceAdd:
      "div.blank-slate-pf-main-action > button:contains('Add')",
  };

  let managementEndpoint: string;

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
      cy.createMailSession(managementEndpoint, testValues);
      cy.createOutboundSocketBinding(managementEndpoint, outBoundSocketBinding);
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  beforeEach(() => {
    cy.navigateTo(managementEndpoint, "mail-session;name=my-mail-session");
    cy.get(itemSelectors.mailServerItem).click();
  });

  it("Create server", () => {
    cy.get(itemSelectors.mailServerAdd).click();
    cy.get(addServerForm.typeSelector).select(testValues.serverType, {
      force: true,
    });
    cy.text(
      addServerForm.id,
      addServerForm.outboundSocket,
      outBoundSocketBinding.name
    );
    cy.get(itemSelectors.buttonAdd).click();
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      address,
      addServerForm.outboundSocket,
      outBoundSocketBinding.name
    );
  });

  it("Create credential-reference", () => {
    cy.selectInTable(mailSessionTable.id, mailSessionTable.outboundSocketType);
    cy.get(itemSelectors.credentialsReferenceTab).click();
    cy.get(itemSelectors.credentialsReferenceAdd).click();
    cy.text(
      credentialsReferenceForm.id,
      credentialsReferenceForm.clearText,
      testValues.clearText
    );
    cy.get(itemSelectors.buttonAdd).click();
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      address,
      credentialsReferenceForm.clearTextCliName,
      testValues.clearText
    );
  });
});
