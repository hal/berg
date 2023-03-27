describe("TESTS: Configuration => Subsystems => Mail => Server", () => {
  const address = ["subsystem", "mail", "mail-session", "my-mail-session", "server", "smtp"];

  const outBoundSocketBinding = {
    name: "custom-outbound-socket-binding",
    host: "localhost",
    port: "15099",
  };

  const serverForm = {
    id: "mail-server-form",
    outboundSocket: "outbound-socket-binding-ref",
    userName: "username",
    password: "password",
    ssl: "ssl",
    tls: "tls",
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
    outboundSocket: "custom-outbound-socket-binding",
    mailSessionName: "my-mail-session",
    userName: "Custom username",
    password: "SecretPassword",
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
    mailServerAdd: "div.pull-right.btn-group.hal-table-buttons > button:contains('Add')",
    buttonAdd: "div.modal-footer > button.btn.btn-hal.btn-primary:contains('Add')",
    buttonYes: "div.modal-footer > button.btn.btn-hal.btn-primary:contains('Yes')",
    credentialsReferenceTab: "a:contains('Credential Reference')",
    credentialsReferenceAdd: "div.blank-slate-pf-main-action > button:contains('Add')",
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
    cy.text(addServerForm.id, addServerForm.outboundSocket, outBoundSocketBinding.name);
    cy.get(itemSelectors.buttonAdd).click();
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, serverForm.outboundSocket, outBoundSocketBinding.name);
  });

  it("Edit outbound-socket", () => {
    cy.selectInTable(mailSessionTable.id, mailSessionTable.outboundSocketType);
    cy.editForm(serverForm.id);
    cy.text(serverForm.id, serverForm.outboundSocket, testValues.outboundSocket);
    cy.saveForm(serverForm.id);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, serverForm.outboundSocket, testValues.outboundSocket);
  });

  it("Edit user-name", () => {
    cy.selectInTable(mailSessionTable.id, mailSessionTable.outboundSocketType);
    cy.editForm(serverForm.id);
    cy.text(serverForm.id, serverForm.userName, testValues.userName);
    cy.saveForm(serverForm.id);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, serverForm.userName, testValues.userName);
  });

  it("Edit password", () => {
    cy.selectInTable(mailSessionTable.id, mailSessionTable.outboundSocketType);
    cy.editForm(serverForm.id);
    cy.text(serverForm.id, serverForm.password, testValues.password);
    cy.saveForm(serverForm.id);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, serverForm.password, testValues.password);
  });

  it("Toggle ssl", () => {
    cy.selectInTable(mailSessionTable.id, mailSessionTable.outboundSocketType);
    cy.getDefaultBooleanValue(managementEndpoint, address, serverForm.ssl).then((defaultValue: boolean) => {
      cy.editForm(serverForm.id);
      cy.flip(serverForm.id, serverForm.ssl, defaultValue);
      cy.saveForm(serverForm.id);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address, serverForm.ssl, !defaultValue);
    });
  });

  it("Toggle tls", () => {
    cy.selectInTable(mailSessionTable.id, mailSessionTable.outboundSocketType);
    cy.getDefaultBooleanValue(managementEndpoint, address, serverForm.tls).then((defaultValue: boolean) => {
      cy.editForm(serverForm.id);
      cy.flip(serverForm.id, serverForm.tls, defaultValue);
      cy.saveForm(serverForm.id);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address, serverForm.tls, !defaultValue);
    });
  });

  it("Create credential-reference", () => {
    cy.selectInTable(mailSessionTable.id, mailSessionTable.outboundSocketType);
    cy.get(itemSelectors.credentialsReferenceTab).click();
    cy.get(itemSelectors.credentialsReferenceAdd).click();
    cy.get(itemSelectors.buttonYes).click();
    cy.text(credentialsReferenceForm.id, credentialsReferenceForm.clearText, testValues.clearText);
    cy.get(itemSelectors.buttonAdd).click();
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, credentialsReferenceForm.clearTextCliName, testValues.clearText);
  });
});
