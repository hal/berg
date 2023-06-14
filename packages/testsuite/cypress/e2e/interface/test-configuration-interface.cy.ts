describe("TESTS: Configuration => Interface", () => {
  const configurationFormId = "interface-form";

  const interfaceToEdit = {
    name: "interface-to-edit",
    inetAddress: "localhost",
  };

  const address = ["interface", interfaceToEdit.name];

  const anyAddress = "any-address";
  const inetAddress = "inet-address";

  let managementEndpoint: string;

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
      cy.addAddress(managementEndpoint, address, {
        "inet-address": interfaceToEdit.inetAddress,
      });
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Toggle any-address", () => {
    let value: boolean;
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: address,
      name: anyAddress,
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "interface;name=" + interfaceToEdit.name);
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, anyAddress, value);
      cy.clearAttribute(configurationFormId, inetAddress);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address, anyAddress, !value);
    });
  });

  it("Reset", () => {
    cy.navigateTo(managementEndpoint, "interface;name=" + interfaceToEdit.name);
    cy.resetForm(configurationFormId, managementEndpoint, address);
  });
});
