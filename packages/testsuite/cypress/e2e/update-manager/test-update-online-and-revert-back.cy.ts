describe("TESTS: Update Manager => Updates => Online updates => Revert", () => {
  let managementEndpoint: string;
  const timeoutTime = 120000;

  const address = ["update-manager", "updates"];
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

  it("Online update", () => {
    cy.navigateToUpdateManagerPage(managementEndpoint, address);
    cy.get("#update-manager-update-update").click();
    cy.get("input[type='radio'][name='type'][value='ONLINE']").check();
    cy.confirmNextInWizard();
    cy.get("#update-manager-list-updates", { timeout: timeoutTime }).should("be.visible").contains(artifactToBeUpdated);
    cy.confirmNextInWizard();
    cy.contains("div.blank-slate-pf.wizard-pf-complete", "Server candidate prepared", { timeout: timeoutTime });
    cy.confirmNextInWizard();
    cy.contains("div.blank-slate-pf.wizard-pf-complete", "Updates applied", { timeout: timeoutTime });
    cy.confirmFinishInWizard();
    // After the update there should be visible 3 items in history
    cy.get("#update-manager-update > ul > li").should("have.length", 3);
  });

  it("Revert the update", () => {
    cy.navigateToUpdateManagerPage(managementEndpoint, address);
    cy.get("#update-manager-update > ul > li").eq(1).click();
    cy.get("#update-manager-update > ul > li").eq(1).find("a.clickable.btn.btn-finder").click();
    cy.get("#update-manager-list-updates", { timeout: timeoutTime }).should("be.visible").contains(artifactToBeUpdated);
    cy.confirmNextInWizard();
    cy.contains("div.blank-slate-pf.wizard-pf-complete", "Server candidate prepared", { timeout: timeoutTime });
    cy.confirmNextInWizard();
    cy.contains("div.blank-slate-pf.wizard-pf-complete", "Updates applied", { timeout: timeoutTime });
    cy.confirmFinishInWizard();
    // After the update there should be visible 4 items in history
    cy.get("#update-manager-update > ul > li").should("have.length", 4);
  });
});
