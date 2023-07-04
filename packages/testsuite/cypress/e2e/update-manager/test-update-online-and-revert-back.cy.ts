describe("TESTS: Update Manager => Updates => Online updates => Revert", () => {
  let managementEndpoint: string;
  const timeoutTime = 120000;

  const address = ["update-manager", "updates"];
  const artifactToBeUpdated = "com.amazonaws:aws-java-sdk-kms";

  before(function () {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
      cy.skipIfNot(cy.isEAP(managementEndpoint), this);
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Online update", () => {
    cy.navigateToUpdateManagerPage(managementEndpoint, address);
    cy.get("#update-manager-update-add-actions").click();
    cy.get("#update-manager-update-online").click();
    cy.get("#update-manager-list-updates", { timeout: timeoutTime }).should("be.visible").contains(artifactToBeUpdated);
    cy.confirmNextInWizard();
    cy.get("div.blank-slate-pf.wizard-pf-complete", { timeout: timeoutTime }).contains("Server candidate prepared");
    cy.confirmNextInWizard();
    cy.get("div.blank-slate-pf.wizard-pf-complete", { timeout: timeoutTime }).contains("Updates applied");
    cy.confirmFinishInWizard();
    // After the update there should be visible 3 items in history
    cy.get("#update-manager-update > ul > li").should("have.length", 3);
  });

  it("Revert the update", () => {
    cy.navigateToUpdateManagerPage(managementEndpoint, address);
    cy.get("#update-manager-update > ul > li").first().click();
    cy.get("#update-manager-update > ul > li > a.clickable.btn.btn-finder").first().click();
    cy.get("#update-manager-list-updates", { timeout: timeoutTime }).should("be.visible").contains(artifactToBeUpdated);
    cy.confirmNextInWizard();
    cy.get("div.blank-slate-pf.wizard-pf-complete", { timeout: timeoutTime }).contains("Server candidate prepared");
    cy.confirmNextInWizard();
    cy.get("div.blank-slate-pf.wizard-pf-complete", { timeout: timeoutTime }).contains("Updates applied");
    cy.confirmFinishInWizard();
    // After the update there should be visible 4 items in history
    cy.get("#update-manager-update > ul > li").should("have.length", 4);
  });
});
