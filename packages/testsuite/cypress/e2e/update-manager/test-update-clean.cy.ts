describe("TESTS: Update Manager => Updates => Clean", () => {
    let managementEndpoint: string;
    let timeout_time = 30000 
  
    const address = ["update-manager", "updates"];
  
    before(() => {
      cy.startWildflyContainer().then((result) => {
        managementEndpoint = result as string;
      });
    });
  
    after(() => {
      cy.task("stop:containers");
    });
    
    it("Update server by custom patch", () => {
      cy.navigateToUpdateManagerPage(managementEndpoint, address);
      cy.get("#update-manager-clean").click();
      cy.verifySuccess();
    });
});
