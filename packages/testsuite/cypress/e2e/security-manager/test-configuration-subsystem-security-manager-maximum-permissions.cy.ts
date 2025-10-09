describe("TESTS: Configuration => Subsystem => Security Manager => Maximum Permissions", () => {
  const address = ["subsystem", "security-manager", "deployment-permissions", "default"];

  const maximumPermissionsNavItem = "#sm-max-permissions-item";
  const maximumPermissionsTableId = "sm-max-permissions-table";
  const maximumPermissionsForm = "sm-max-permissions-form";
  const maximumPermissionsAddWizardFormId = "sm-max-permissions-add";
  const maximumPermissionsClass = "java.io.FilePermission";
  const maximumPermissionsToDeleteClass = "java.security.AllPermission";
  const maximumPermissionsAttrubuteName = "maximum-permissions";

  let managementEndpoint: string;

  const maximumPermissions = {
    create: {
      class: maximumPermissionsClass,
      name: "/tmp/create",
      actions: "read, write",
    },
    update: {
      class: maximumPermissionsClass + "-updated",
      name: "/tmp/update",
      actions: "read",
    },
    delete: {
      class: maximumPermissionsToDeleteClass,
    },
  };

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
    });
  });

  beforeEach(() => {
    cy.navigateTo(managementEndpoint, "security-manager");
    cy.get(maximumPermissionsNavItem).click();
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Delete default Maximum Permissions", () => {
    cy.verifyListAttributeContains(
      managementEndpoint,
      address,
      maximumPermissionsAttrubuteName,
      maximumPermissions.delete,
    );
    cy.removeFromTable(maximumPermissionsTableId, maximumPermissions.delete.class);
    cy.verifySuccess();
    cy.verifyRemovedFromTable(maximumPermissionsTableId, maximumPermissions.delete.class);
    cy.verifyListAttributeDoesNotContain(
      managementEndpoint,
      address,
      maximumPermissionsAttrubuteName,
      maximumPermissions.delete,
    );
  });

  it("Try to create Maximum Permissions", () => {
    cy.addInTable(maximumPermissionsTableId);
    cy.text(maximumPermissionsAddWizardFormId, "name", maximumPermissions.create.name);
    cy.text(maximumPermissionsAddWizardFormId, "actions", maximumPermissions.create.actions);
    cy.confirmAddResourceWizard();
    cy.verifyElementHasClass(maximumPermissionsAddWizardFormId, "class", "div", "has-error");
    cy.closeWizard();
  });

  it("Create Maximum Permissions", () => {
    cy.addInTable(maximumPermissionsTableId);
    cy.text(maximumPermissionsAddWizardFormId, "class", maximumPermissions.create.class);
    cy.text(maximumPermissionsAddWizardFormId, "name", maximumPermissions.create.name);
    cy.text(maximumPermissionsAddWizardFormId, "actions", maximumPermissions.create.actions);
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.verifyListAttributeContains(
      managementEndpoint,
      address,
      maximumPermissionsAttrubuteName,
      maximumPermissions.create,
    );
  });

  it("Try to update Maximum Permissions", () => {
    cy.get("#" + maximumPermissionsTableId + " tbody tr.odd td.sorting_1").click();
    cy.editForm(maximumPermissionsForm);
    cy.text(maximumPermissionsForm, "name", maximumPermissions.update.name);
    cy.text(maximumPermissionsForm, "actions", maximumPermissions.update.actions);
    cy.clearAttribute(maximumPermissionsForm, "class");
    cy.saveForm(maximumPermissionsForm);
    cy.verifyElementHasClass(maximumPermissionsForm, "class", "div", "has-error");
    cy.cancelForm(maximumPermissionsForm);
  });

  it("Update Maximum Permissions", () => {
    cy.get("#" + maximumPermissionsTableId + " tbody tr.odd td.sorting_1").click();
    cy.editForm(maximumPermissionsForm);
    cy.text(maximumPermissionsForm, "class", maximumPermissions.update.class);
    cy.text(maximumPermissionsForm, "name", maximumPermissions.update.name);
    cy.text(maximumPermissionsForm, "actions", maximumPermissions.update.actions);
    cy.saveForm(maximumPermissionsForm);
    cy.verifySuccess();
    cy.verifyListAttributeContains(
      managementEndpoint,
      address,
      maximumPermissionsAttrubuteName,
      maximumPermissions.update,
    );
  });
});
