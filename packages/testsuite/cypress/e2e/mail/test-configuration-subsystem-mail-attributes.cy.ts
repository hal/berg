describe("TESTS: Configuration => Subsystems => Mail => Attributes", () => {
  const address = ["subsystem", "mail", "mail-session", "my-mail-session"];

  const mailConfigurationPath =
    "configuration;path=configuration~subsystems!css~mail";

  const attributesForm = {
    id: "mail-session-form",
    name: "name",
    debug: "debug",
    from: "from",
    jndi: "jndi-name",
  };

  const testValues = {
    mailSessionName: "my-mail-session",
    fromDefault: "defaultFromValue",
    fromNew: "newFromValue",
    jndiDefault: "java:jboss/mail/MyDefault",
    jndiNew: "java:jboss/mail/Custom",
  };

  const itemSelectors = {
    mailAttributesItem: "#mail-session-item a",
    mailSessionAdd: "#mail-session-add",
    buttonAdd:
      "div.modal-footer > button.btn.btn-hal.btn-primary:contains('Add')",
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
    cy.navigateTo(managementEndpoint, "mail-session;name=my-mail-session");
    cy.get(itemSelectors.mailAttributesItem).click();
  });

  it("Create custom mail session", () => {
    cy.navigateTo(managementEndpoint, mailConfigurationPath);
    cy.get(itemSelectors.mailSessionAdd).click();
    cy.text(attributesForm.id, attributesForm.name, testValues.mailSessionName);
    cy.text(attributesForm.id, attributesForm.from, testValues.fromDefault);
    cy.text(attributesForm.id, attributesForm.jndi, testValues.jndiDefault);
    cy.get(itemSelectors.buttonAdd).click();
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      address,
      attributesForm.from,
      testValues.fromDefault
    );
    cy.verifyAttribute(
      managementEndpoint,
      address,
      attributesForm.jndi,
      testValues.jndiDefault
    );
  });

  it("Toggle debug", () => {
    cy.getDefaultBooleanValue(
      managementEndpoint,
      address,
      attributesForm.debug
    ).then((defaultValue: boolean) => {
      cy.editForm(attributesForm.id);
      cy.flip(attributesForm.id, attributesForm.debug, defaultValue);
      cy.saveForm(attributesForm.id);
      cy.verifySuccess();
      cy.verifyAttribute(
        managementEndpoint,
        address,
        attributesForm.debug,
        !defaultValue
      );
    });
  });

  it("Edit from", () => {
    cy.editForm(attributesForm.id);
    cy.text(attributesForm.id, attributesForm.from, testValues.fromNew);
    cy.saveForm(attributesForm.id);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      address,
      attributesForm.from,
      testValues.fromNew
    );
  });

  it("Edit jndi-name", () => {
    cy.editForm(attributesForm.id);
    cy.text(attributesForm.id, attributesForm.jndi, testValues.jndiNew);
    cy.saveForm(attributesForm.id);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      address,
      attributesForm.jndi,
      testValues.jndiNew
    );
  });
});
