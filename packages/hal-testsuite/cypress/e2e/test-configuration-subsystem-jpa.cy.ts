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
    cy.editForm(configurationFormId);
    cy.formInput(
      configurationFormId,
      "default-extended-persistence-inheritance"
    ).select("SHALLOW", { force: true });
    cy.formInput(
      configurationFormId,
      "default-extended-persistence-inheritance"
    ).trigger("change", { force: true });
    cy.formInput(
      configurationFormId,
      "default-extended-persistence-inheritance"
    ).should("have.value", "SHALLOW");
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
    cy.resetForm(configurationFormId, managementEndpoint, ["subsystem", "jpa"]);
  });
});
