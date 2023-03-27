describe("TESTS: Configuration => Subsystem => EJB => Container => Container", () => {
  let managementEndpoint: string;

  const address = ["subsystem", "ejb3"];
  const configurationFormId = "ejb3-configuration-form";

  const securityDomainToUpdate = "sec-domain-to-update";
  const cacheToUpdate = "cache-to-update";
  const slsbToUpdate = "slsb-to-update";

  before(() => {
    cy.startWildflyContainer()
      .then((result) => {
        managementEndpoint = result as string;
      })
      .then(() => {
        cy.addAddress(
          managementEndpoint,
          ["subsystem", "ejb3", "application-security-domain", securityDomainToUpdate],
          {
            "security-domain": "ApplicationDomain",
          }
        );
        cy.addAddress(managementEndpoint, ["subsystem", "ejb3", "cache", cacheToUpdate]);
        cy.addAddress(managementEndpoint, ["subsystem", "ejb3", "strict-max-bean-instance-pool", slsbToUpdate]);
      });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Toggle allow-ejb-name-regex", () => {
    let value = false;
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: address,
      name: "allow-ejb-name-regex",
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "ejb3-configuration");
      cy.get("#ejb3-container-item").click();
      cy.get("#ejb3-configuration-item").click();
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, "allow-ejb-name-regex", value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address, "allow-ejb-name-regex", !value);
    });
  });

  it("Edit client-interceptors via type", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-container-item").click();
    cy.get("#ejb3-configuration-item").click();
    cy.editForm(configurationFormId);
    cy.formInput(configurationFormId, "client-interceptors")
      .clear()
      .type("someClass,someModule{enter}")
      .trigger("change");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyListAttributeContains(managementEndpoint, address, "client-interceptors", {
      class: "someClass",
      module: "someModule",
    });
  });

  it("Edit client-interceptors via wizard", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-container-item").click();
    cy.get("#ejb3-configuration-item").click();
    cy.editForm(configurationFormId);
    cy.formInput(configurationFormId, "client-interceptors")
      .parent()
      .within(() => {
        cy.get(".btn.btn-default").click();
      });
    cy.text("resolve-expression-form", "class", "anotherClass");
    cy.text("resolve-expression-form", "module", "anotherModule");
    cy.confirmAddResourceWizard();
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyListAttributeContains(managementEndpoint, address, "client-interceptors", {
      class: "anotherClass",
      module: "anotherModule",
    });
  });

  it("Edit default-distinct-name", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-container-item").click();
    cy.get("#ejb3-configuration-item").click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "default-distinct-name", "distinct-name-updated");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, "default-distinct-name", "distinct-name-updated");
  });

  it("Edit default-entity-bean-instance-pool", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-container-item").click();
    cy.get("#ejb3-configuration-item").click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "default-entity-bean-instance-pool", "default-entity-bean-instance-pool-updated");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      address,
      "default-entity-bean-instance-pool",
      "default-entity-bean-instance-pool-updated"
    );
  });

  it("Toggle default-entity-bean-optimistic-locking", () => {
    let value = false;
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: address,
      name: "default-entity-bean-optimistic-locking",
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "ejb3-configuration");
      cy.get("#ejb3-container-item").click();
      cy.get("#ejb3-configuration-item").click();
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, "default-entity-bean-optimistic-locking", value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address, "default-entity-bean-optimistic-locking", !value);
    });
  });

  it("Edit default-mdb-instance-pool", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-container-item").click();
    cy.get("#ejb3-configuration-item").click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "default-mdb-instance-pool", "default-mdb-instance-pool-updated");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, "default-mdb-instance-pool", "default-mdb-instance-pool-updated");
  });

  it("Toggle default-missing-method-permissions-deny-access", () => {
    let value = false;
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: address,
      name: "default-missing-method-permissions-deny-access",
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "ejb3-configuration");
      cy.get("#ejb3-container-item").click();
      cy.get("#ejb3-configuration-item").click();
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, "default-missing-method-permissions-deny-access", value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address, "default-missing-method-permissions-deny-access", !value);
    });
  });

  it("Edit default-resource-adapter-name", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-container-item").click();
    cy.get("#ejb3-configuration-item").click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "default-resource-adapter-name", "ra-updated");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, "default-resource-adapter-name", "ra-updated");
  });

  it("Edit default-security-domain", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-container-item").click();
    cy.get("#ejb3-configuration-item").click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "default-security-domain", securityDomainToUpdate);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, "default-security-domain", securityDomainToUpdate);
  });

  it("Edit default-sfsb-cache", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-container-item").click();
    cy.get("#ejb3-configuration-item").click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "default-sfsb-cache", cacheToUpdate);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, "default-sfsb-cache", cacheToUpdate);
  });

  it("Edit default-sfsb-passivation-disabled-cache", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-container-item").click();
    cy.get("#ejb3-configuration-item").click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "default-sfsb-passivation-disabled-cache", cacheToUpdate);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, "default-sfsb-passivation-disabled-cache", cacheToUpdate);
  });

  it("Edit default-singleton-bean-access-timeout", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-container-item").click();
    cy.get("#ejb3-configuration-item").click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "default-singleton-bean-access-timeout", "3000");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, "default-singleton-bean-access-timeout", 3000);
  });

  it("Edit default-slsb-instance-pool", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-container-item").click();
    cy.get("#ejb3-configuration-item").click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "default-slsb-instance-pool", slsbToUpdate);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, "default-slsb-instance-pool", slsbToUpdate);
  });

  it("Edit default-stateful-bean-access-timeout", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-container-item").click();
    cy.get("#ejb3-configuration-item").click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "default-stateful-bean-access-timeout", "3000");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, "default-stateful-bean-access-timeout", 3000);
  });

  it("Edit default-stateful-bean-session-timeout", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-container-item").click();
    cy.get("#ejb3-configuration-item").click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "default-stateful-bean-session-timeout", "3000");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, "default-stateful-bean-session-timeout", 3000);
  });

  it("Toggle enable-graceful-txn-shutdown", () => {
    let value = false;
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: address,
      name: "enable-graceful-txn-shutdown",
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "ejb3-configuration");
      cy.get("#ejb3-container-item").click();
      cy.get("#ejb3-configuration-item").click();
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, "enable-graceful-txn-shutdown", value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address, "enable-graceful-txn-shutdown", !value);
    });
  });

  it("Toggle in-vm-remote-interface-invocation-pass-by-value", () => {
    let value = false;
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: address,
      name: "in-vm-remote-interface-invocation-pass-by-value",
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "ejb3-configuration");
      cy.get("#ejb3-container-item").click();
      cy.get("#ejb3-configuration-item").click();
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, "in-vm-remote-interface-invocation-pass-by-value", value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address, "in-vm-remote-interface-invocation-pass-by-value", !value);
    });
  });

  it("Toggle log-system-exceptions", () => {
    let value = false;
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: address,
      name: "log-system-exceptions",
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "ejb3-configuration");
      cy.get("#ejb3-container-item").click();
      cy.get("#ejb3-configuration-item").click();
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, "log-system-exceptions", value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address, "log-system-exceptions", !value);
    });
  });

  it("Edit server-interceptors via type", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-container-item").click();
    cy.get("#ejb3-configuration-item").click();
    cy.editForm(configurationFormId);
    cy.formInput(configurationFormId, "server-interceptors")
      .clear()
      .type("someClass,someModule{enter}")
      .trigger("change");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyListAttributeContains(managementEndpoint, address, "server-interceptors", {
      class: "someClass",
      module: "someModule",
    });
  });

  it("Edit server-interceptors via wizard", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-container-item").click();
    cy.get("#ejb3-configuration-item").click();
    cy.editForm(configurationFormId);
    cy.formInput(configurationFormId, "server-interceptors")
      .parent()
      .within(() => {
        cy.get(".btn.btn-default").click();
      });
    cy.text("resolve-expression-form", "class", "anotherClass");
    cy.text("resolve-expression-form", "module", "anotherModule");
    cy.confirmAddResourceWizard();
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyListAttributeContains(managementEndpoint, address, "server-interceptors", {
      class: "anotherClass",
      module: "anotherModule",
    });
  });

  it("Reset", () => {
    cy.navigateTo(managementEndpoint, "ejb3-configuration");
    cy.get("#ejb3-container-item").click();
    cy.get("#ejb3-configuration-item").click();
    cy.resetForm(configurationFormId, managementEndpoint, address);
  });
});
