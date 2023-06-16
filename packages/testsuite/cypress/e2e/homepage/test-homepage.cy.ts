describe("TESTS: Homepage", () => {
  const specName = Cypress.spec.name.replace(/\.cy\.ts/g, "").replace(/-/g, "_");
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
    let productVersion = "";
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: [],
      name: "product-version",
    }).then((result) => {
      productVersion = (result as { result: string }).result;
      cy.get("span.pficon.pficon-info").parent().click();
      cy.get("div.product-versions-pf")
        .should("be.visible")
        .contains("Product Version")
        .next()
        .should("include.text", productVersion);
    });
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

  it("Should load Update Manager page if product version is EAP", function() {
    cy.get("#about-modal").then(($productInfo) => {
      if ($productInfo.text().includes("EAP")) {
        cy.get("#tlc-installer").click();
        cy.get("#hal-finder-preview").should("be.visible");
        cy.url().should((url) => {
          expect(url).to.contain("#update-manager");
        });
      } else {
        this.skip();
      }
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
