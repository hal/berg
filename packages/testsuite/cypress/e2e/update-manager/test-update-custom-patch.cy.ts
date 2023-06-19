describe("TESTS: Update Manager => Updates => Custom patches", () => {
  let managementEndpoint: string;
  const timeoutTime = 30000;

  const address = ["update-manager", "updates"];
  const zipFile = Cypress.env("PATCH_ZIP") as string;
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

  it("Update server by custom patch", () => {
    cy.navigateToUpdateManagerPage(managementEndpoint, address);
    cy.get("#update-manager-update-add-actions").click();
    cy.get("#update-manager-update-patch").click();
    cy.get("input#update-manager-update-patch-form-custom-patch-file-editing").selectFile(zipFile, {
      action: "drag-drop",
      force: true,
    });
    cy.text("update-manager-update-patch-form", "manifest", "org.jboss.qe.eap:one-off-1");
    cy.confirmNextInWizard();
    cy.get("#update-manager-list-updates", { timeout: timeoutTime }).should("be.visible").contains(artifactToBeUpdated);
    cy.confirmNextInWizard();
    cy.get("div.blank-slate-pf.wizard-pf-complete", { timeout: timeoutTime }).contains("Server candidate prepared");
    cy.confirmNextInWizard();
    cy.get("div.blank-slate-pf.wizard-pf-complete", { timeout: timeoutTime }).contains("Updates applied");
    cy.confirmFinishInWizard();
    // After the update there should be visible 3 items in history
    cy.get("#update-manager-update > ul > li").should("have.length", 3);
  });
});
