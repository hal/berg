describe("TESTS: Homepage", () => {
  const specName = Cypress.spec.name
    .replace(/\.cy\.ts/g, "")
    .replace(/-/g, "_");
  let managementEndpoint: string;

  before(() => {
    cy.task("start:wildfly:container", { name: specName }).then((result) => {
      managementEndpoint = result as string;
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  beforeEach(() => {
    cy.navigateTo(managementEndpoint, "home");
  });

  it("Should display About info", () => {
    cy.get("a.tool.clickable > span.pficon").click({ force: true });
    cy.get("div.product-versions-pf")
      .contains("Product Version")
      .siblings("dd")
      .should("include.text", "26.1.0.Final");
  });

  it("Should load Deployments page", () => {
    cy.get("#tlc-deployments").click();
    cy.get("#hal-finder-preview").should("be.visible");
    cy.url().should((url) => {
      expect(url).to.contain("#deployments");
    });
  });

  it("Should load Configuration page", () => {
    cy.get("#tlc-configuration").click();
    cy.get("#hal-finder-preview").should("be.visible");
    cy.url().should((url) => {
      expect(url).to.contain("#configuration");
    });
  });

  it("Should load Runtime page", () => {
    cy.get("#tlc-runtime").click();
    cy.get("#hal-finder-preview").should("be.visible");
    cy.url().should((url) => {
      expect(url).to.contain("#runtime");
    });
  });

  it("Should load Patching page", () => {
    cy.get("#tlc-patching").click();
    cy.get("#hal-finder-preview").should("be.visible");
    cy.url().should((url) => {
      expect(url).to.contain("#patching");
    });
  });

  it("Should load Access Control page", () => {
    cy.get("#tlc-access-control").click();
    cy.get("#hal-finder-preview").should("be.visible");
    cy.url().should((url) => {
      expect(url).to.contain("#access-control");
    });
  });
});
