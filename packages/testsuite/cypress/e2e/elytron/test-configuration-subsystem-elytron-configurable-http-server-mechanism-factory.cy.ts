describe("TESTS: Configuration => Subsystem => Security => Settings => Factories / Transformers => HTTP Factories => Configurable HTTP Server Mechanism Factory", () => {
  let managementEndpoint: string;

  const address = ["subsystem", "elytron", "configurable-http-server-mechanism-factory", "configurableHTTPserver"];

  const httpServerMechanismFactory = "elytron-configurable-http-server-mechanism-factory";
  const httpServerMechanismFactoryFiltrs = httpServerMechanismFactory + "-filters";

  const navigationMenu = {
    httpFactoriesItem: "#http-factories-item",
    configurableHTTPServer: "#" + httpServerMechanismFactory + "-item",
  };

  const factoryForm = {
    id: httpServerMechanismFactory + "-add",
    fieldName: {
      name: "name",
      value: "configurableHTTPserver",
    },
    fieldFactory: {
      name: "http-server-mechanism-factory",
      value: "global",
    },
  };

  const filterForm = {
    id: httpServerMechanismFactoryFiltrs + "-add",
    fieldEnabled: {
      id: "#" + httpServerMechanismFactoryFiltrs + "-add-editing > div:nth-child(2)",
      text: "Enabling",
    },
    fieldPatternFilter: {
      name: "pattern-filter",
      value: ".*",
    },
    expectedResult: { enabling: true, "pattern-filter": ".*" },
  };

  const filtrsButtonForConfigurableHttpServer = "#hal-uid-1";

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
    });
  });

  beforeEach(() => {
    cy.navigateTo(managementEndpoint, "elytron-factories-transformers");
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Add filter to Factory", () => {
    cy.get(navigationMenu.httpFactoriesItem).click();
    cy.get(navigationMenu.configurableHTTPServer).click();
    cy.addInTable(httpServerMechanismFactory + "-table");
    cy.text(factoryForm.id, factoryForm.fieldName.name, factoryForm.fieldName.value);
    cy.text(factoryForm.id, factoryForm.fieldFactory.name, factoryForm.fieldFactory.value);
    cy.confirmAddResourceWizard();
    cy.get(filtrsButtonForConfigurableHttpServer).click();
    cy.addInTable(httpServerMechanismFactoryFiltrs + "-table");
    cy.get(filterForm.fieldEnabled.id).should("be.visible").should("contain.text", filterForm.fieldEnabled.text);
    cy.text(filterForm.id, filterForm.fieldPatternFilter.name, filterForm.fieldPatternFilter.value);
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.verifyListAttributeContains(managementEndpoint, address, "filters", filterForm.expectedResult);
  });
});
