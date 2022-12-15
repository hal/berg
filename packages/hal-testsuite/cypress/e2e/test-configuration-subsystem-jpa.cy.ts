describe("TESTS: Configuration => Subsystem => JPA", () => {
  const configurationFormId = "jpa-form";

  let managementEndpoint: string;

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Edit default-extended-persistence-inheritance", () => {
    cy.navigateTo(managementEndpoint, "jpa-configuration");
    cy.get("#jpa-form-editing").should("not.be.visible");
    cy.editForm(configurationFormId);
    cy.get("#jpa-form-editing").should("be.visible");
    cy.get("#jpa-form-default-extended-persistence-inheritance-editing")
      .select("SHALLOW", { force: true })
      .should("have.value", "SHALLOW");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      ["subsystem", "jpa"],
      "default-extended-persistence-inheritance",
      "SHALLOW"
    );
  });

  it("Reset", () => {
    cy.navigateTo(managementEndpoint, "jpa-configuration");
    cy.resetForm(configurationFormId, managementEndpoint + "/management", [
      "subsystem",
      "jpa",
    ]);
  });
});
