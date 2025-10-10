describe("TESTS: Configuration => Subsystem => EE => Globals", () => {
  let managementEndpoint: string;

  const address = ["subsystem", "ee"];
  const globalModulesTableId = "ee-global-modules-table";
  const emptyConfigurationForm = "ee-global-directory-form-empty";
  const configurationFormId = "ee-global-directory-form";

  const globalModuleToRemove = {
    name: "global-module-to-remove",
    "meta-inf": true,
    services: true,
    annotations: true,
  };

  const globalModuleToAdd = {
    name: "global-module-to-add",
    "meta-inf": true,
    services: true,
    annotations: true,
    slot: null,
  };

  const globalDirectory = {
    name: "test-global-directory",
    path: "tgd",
  };

  before(() => {
    cy.startWildflyContainer()
      .then((result) => {
        managementEndpoint = result as string;
      })
      .then(() => {
        cy.task("execute:cli", {
          managementApi: `${managementEndpoint}/management`,
          operation: "write-attribute",
          address: address,
          name: "global-modules",
          value: [globalModuleToRemove],
        });
      });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Create Global Module", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-global-modules-item").click();
    cy.addInTable(globalModulesTableId);
    cy.text("ee-global-modules-form", "name", globalModuleToAdd.name);
    cy.flip("ee-global-modules-form", "annotations", !globalModuleToAdd.annotations);
    cy.flip("ee-global-modules-form", "services", !globalModuleToAdd.services);
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.verifyListAttributeContains(managementEndpoint, address, "global-modules", globalModuleToAdd);
  });

  it("Remove Global Module", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-global-modules-item").click();
    cy.removeFromTable(globalModulesTableId, globalModuleToRemove.name);
    cy.verifySuccess();
    cy.verifyListAttributeDoesNotContain(managementEndpoint, address, "global-modules", globalModuleToRemove);
  });

  it("Create Global Directory", () => {
    cy.removeAddressIfExists(managementEndpoint, ["subsystem", "ee", "global-directory", globalDirectory.name]);
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-global-modules-item").click();
    cy.addSingletonResource(emptyConfigurationForm);
    cy.text("ee-global-directory-add", "name", globalDirectory.name);
    cy.text("ee-global-directory-add", "path", globalDirectory.path);
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.validateAddress(managementEndpoint, ["subsystem", "ee", "global-directory", globalDirectory.name], true);
  });

  it("Edit path", () => {
    cy.addAddressIfDoesntExist(managementEndpoint, ["subsystem", "ee", "global-directory", globalDirectory.name], {
      path: globalDirectory.path,
    });
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-global-modules-item").click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "path", "updated-path");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      ["subsystem", "ee", "global-directory", globalDirectory.name],
      "path",
      "updated-path",
    );
  });

  it("Remove Global Directory", () => {
    cy.addAddressIfDoesntExist(managementEndpoint, ["subsystem", "ee", "global-directory", globalDirectory.name], {
      path: globalDirectory.path,
    });
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-global-modules-item").click();
    cy.removeSingletonResource(configurationFormId);
    cy.verifySuccess();
    cy.validateAddress(managementEndpoint, ["subsystem", "ee", "global-directory", globalDirectory.name], false);
  });

  it("Reset Global Directory", () => {
    cy.addAddressIfDoesntExist(managementEndpoint, ["subsystem", "ee", "global-directory", globalDirectory.name], {
      path: globalDirectory.path,
    });
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-global-modules-item").click();
    cy.resetForm(configurationFormId, managementEndpoint, [
      "subsystem",
      "ee",
      "global-directory",
      globalDirectory.name,
    ]);
  });
});
