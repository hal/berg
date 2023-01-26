describe("TESTS: Configuration => Subsystem => EJB => Services => Identity", () => {
  let managementEndpoint: string;

  const address = ["subsystem", "ejb3", "service", "identity"];
  const configurationFormId = "ejb3-service-identity-form";

  const emptyForm = "ejb3-service-identity-form-empty";
  const securityDomainToUpdate = "SecDomainToUpdate";

  before(() => {
    cy.startWildflyContainer()
      .then((result) => {
        managementEndpoint = result as string;
      })
      .then(() => {
        cy.addAddress(managementEndpoint, [
          "subsystem",
          "elytron",
          "security-domain",
          securityDomainToUpdate,
        ]);
      });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Create Identity Service", () => {
    cy.removeAddressIfExists(managementEndpoint, address);
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-service-item").click();
    cy.get("#ejb3-service-identity-item").click();
    cy.addSingletonResource(emptyForm);
    cy.verifySuccess();
    cy.validateAddress(managementEndpoint, address, true);
  });

  it("Edit outflow-security-domains", () => {
    cy.addAddressIfDoesntExist(managementEndpoint, address);
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-service-item").click();
    cy.get("#ejb3-service-identity-item").click();
    cy.editForm(configurationFormId);
    cy.formInput(configurationFormId, "outflow-security-domains")
      .clear()
      .type(`${securityDomainToUpdate}{enter}`)
      .trigger("change");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyListAttributeContains(
      managementEndpoint,
      address,
      "outflow-security-domains",
      securityDomainToUpdate
    );
  });

  it("Reset", () => {
    cy.addAddressIfDoesntExist(managementEndpoint, address);
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-service-item").click();
    cy.get("#ejb3-service-identity-item").click();
    cy.resetForm(configurationFormId, managementEndpoint, address);
  });

  it("Remove", () => {
    cy.addAddressIfDoesntExist(managementEndpoint, address);
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-service-item").click();
    cy.get("#ejb3-service-identity-item").click();
    cy.removeSingletonResource(configurationFormId);
    cy.verifySuccess();
    cy.validateAddress(managementEndpoint, address, false);
  });
});
