describe("TESTS: Configuration => Subsystem => Distributable Web => Routing", () => {
  let managementEndpoint: string;

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
    });
  });

  after(() => {
    cy.task("stop:containers");
  });
});
