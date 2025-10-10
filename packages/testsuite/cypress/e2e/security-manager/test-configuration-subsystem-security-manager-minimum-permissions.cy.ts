describe("TESTS: Configuration => Subsystem => Security Manager => Minimum Permissions", () => {
  const address = ["subsystem", "security-manager", "deployment-permissions", "default"];

  const mininumPermissionsTableId = "sm-min-permissions-table";
  const mininumPermissionsForm = "sm-min-permissions-form";
  const mininumPermissionsAddWizardFormId = "sm-min-permissions-add";
  const mininumPermissionsClass = "java.io.FilePermission";
  const mininumPermissionsToDeleteClass = "java.util.PropertyPermission";
  const mininumPermissionsAttrubuteName = "minimum-permissions";

  let managementEndpoint: string;

  const mininumPermissions = {
    create: {
      class: mininumPermissionsClass,
      name: "/tmp/create",
      actions: "read, write",
    },
    update: {
      class: mininumPermissionsClass + "-updated",
      name: "/tmp/update",
      actions: "read",
    },
    delete: {
      class: mininumPermissionsToDeleteClass,
      name: "property-to-delete",
      actions: "read, write",
    },
  };

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
      cy.task("execute:cli", {
        operation: "write-attribute",
        managementApi: `${managementEndpoint}/management`,
        address: address,
        name: mininumPermissionsAttrubuteName,
        value: [
          {
            class: mininumPermissions.delete.class,
            name: mininumPermissions.delete.name,
            actions: mininumPermissions.delete.actions,
          },
        ],
      });
    });
  });

  beforeEach(() => {
    cy.navigateTo(managementEndpoint, "security-manager");
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Try to create Minimum Permissions", () => {
    cy.addInTable(mininumPermissionsTableId);
    cy.text(mininumPermissionsAddWizardFormId, "name", mininumPermissions.create.name);
    cy.text(mininumPermissionsAddWizardFormId, "actions", mininumPermissions.create.actions);
    cy.confirmAddResourceWizard();
    cy.verifyElementHasClass(mininumPermissionsAddWizardFormId, "class", "div", "has-error");
    cy.closeWizard();
  });

  it("Create Minimum Permissions", () => {
    cy.addInTable(mininumPermissionsTableId);
    cy.text(mininumPermissionsAddWizardFormId, "class", mininumPermissions.create.class);
    cy.text(mininumPermissionsAddWizardFormId, "name", mininumPermissions.create.name);
    cy.text(mininumPermissionsAddWizardFormId, "actions", mininumPermissions.create.actions);
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.verifyListAttributeContains(
      managementEndpoint,
      address,
      mininumPermissionsAttrubuteName,
      mininumPermissions.create,
    );
  });

  it("Try to update Minimum Permissions", () => {
    cy.get("#" + mininumPermissionsTableId + " tbody tr.odd td.sorting_1").click();
    cy.editForm(mininumPermissionsForm);
    cy.text(mininumPermissionsForm, "name", mininumPermissions.update.name);
    cy.text(mininumPermissionsForm, "actions", mininumPermissions.update.actions);
    cy.clearAttribute(mininumPermissionsForm, "class");
    cy.saveForm(mininumPermissionsForm);
    cy.verifyElementHasClass(mininumPermissionsForm, "class", "div", "has-error");
    cy.cancelForm(mininumPermissionsForm);
  });

  it("Update Minimum Permissions", () => {
    cy.get("#" + mininumPermissionsTableId + " tbody tr.odd td.sorting_1").click();
    cy.editForm(mininumPermissionsForm);
    cy.text(mininumPermissionsForm, "class", mininumPermissions.update.class);
    cy.text(mininumPermissionsForm, "name", mininumPermissions.update.name);
    cy.text(mininumPermissionsForm, "actions", mininumPermissions.update.actions);
    cy.saveForm(mininumPermissionsForm);
    cy.verifySuccess();
    cy.verifyListAttributeContains(
      managementEndpoint,
      address,
      mininumPermissionsAttrubuteName,
      mininumPermissions.update,
    );
  });

  it("Delete Minimum Permissions", () => {
    cy.verifyListAttributeContains(
      managementEndpoint,
      address,
      mininumPermissionsAttrubuteName,
      mininumPermissions.delete,
    );
    cy.removeFromTable(mininumPermissionsTableId, mininumPermissions.delete.class);
    cy.verifySuccess();
    cy.verifyRemovedFromTable(mininumPermissionsTableId, mininumPermissions.delete.class);
    cy.verifyListAttributeDoesNotContain(
      managementEndpoint,
      address,
      mininumPermissionsAttrubuteName,
      mininumPermissions.delete,
    );
  });
});
