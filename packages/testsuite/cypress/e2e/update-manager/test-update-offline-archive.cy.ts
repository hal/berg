describe("TESTS: Update Manager => Updates => Offline using archive", () => {
  let managementEndpoint: string;
  const timeoutTime = 120000;

  const address = ["update-manager", "updates"];
  const zipFile = Cypress.env("UPDATE_ZIP") as string;
  const artifactToBeUpdated = "software.amazon.awssdk:aws-core";

  before(function () {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
      cy.skipIfNot(cy.isEAP(managementEndpoint), this);
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Ofline update from zip", () => {
    cy.navigateToUpdateManagerPage(managementEndpoint, address);
    cy.get("#update-manager-update-add-actions").click();
    cy.get("#update-manager-update-offline").click();
    cy.get("input#upload-file-input").selectFile(zipFile, {
      action: "drag-drop",
      force: true,
    });
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
