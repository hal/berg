describe("TESTS: Configuration => Subsystem => Security => Settings => Global Settings", () => {
  let managementEndpoint: string;

  const address = ["subsystem", "elytron"];

  const configurationFormId = "elytron-global-settings-form";

  const authenticationContextToUpdate = "actx-update";
  const sslContextToUpdate = "client-ssl-ctx-update";
  const providerLoaders = {
    initial: {
      name: "pl-initial",
    },
    final: {
      name: "pl-final",
    },
  };

  before(() => {
    cy.startWildflyContainer()
      .then((result) => {
        managementEndpoint = result as string;
      })
      .then(() => {
        cy.addAddress(managementEndpoint, address.concat("authentication-context", authenticationContextToUpdate));
        cy.addAddress(managementEndpoint, address.concat("client-ssl-context", sslContextToUpdate));
        cy.addAddress(managementEndpoint, address.concat("provider-loader", providerLoaders.initial.name));
        cy.addAddress(managementEndpoint, address.concat("provider-loader", providerLoaders.final.name));
      });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Edit default-authentication-context", () => {
    cy.navigateTo(managementEndpoint, "elytron");
    // this call is just workaround to prevent of occuring JBEAP-25005
    cy.help();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "default-authentication-context", authenticationContextToUpdate);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, "default-authentication-context", authenticationContextToUpdate);
  });

  it("Edit default-ssl-context", () => {
    cy.navigateTo(managementEndpoint, "elytron");
    // this call is just workaround to prevent of occuring JBEAP-25005
    cy.help();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "default-ssl-context", sslContextToUpdate);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, "default-ssl-context", sslContextToUpdate);
  });

  it("Edit disallowed-providers", () => {
    cy.navigateTo(managementEndpoint, "elytron");
    // this call is just workaround to prevent of occuring JBEAP-25005
    cy.help();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "disallowed-providers", "DisallowedProvider");
    cy.formInput(configurationFormId, "disallowed-providers").type("{enter}").trigger("change");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyListAttributeContains(managementEndpoint, address, "disallowed-providers", "DisallowedProvider");
  });

  it("Edit final-providers", () => {
    cy.navigateTo(managementEndpoint, "elytron");
    // this call is just workaround to prevent of occuring JBEAP-25005
    cy.help();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "final-providers", providerLoaders.final.name);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, "final-providers", providerLoaders.final.name);
  });

  it("Edit initial-providers", () => {
    cy.navigateTo(managementEndpoint, "elytron");
    // this call is just workaround to prevent of occuring JBEAP-25005
    cy.help();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "initial-providers", providerLoaders.initial.name);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, "initial-providers", providerLoaders.initial.name);
  });

  it("Toggle register-jaspi-factory", () => {
    let value = false;
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: address,
      name: "register-jaspi-factory",
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "elytron");
      // this call is just workaround to prevent of occuring JBEAP-25005
      cy.help();
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, "register-jaspi-factory", value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address, "register-jaspi-factory", !value);
    });
  });

  it("Edit security-properties", () => {
    cy.navigateTo(managementEndpoint, "elytron");
    // this call is just workaround to prevent of occuring JBEAP-25005
    cy.help();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "security-properties", "prop=val");
    cy.formInput(configurationFormId, "security-properties").type("{enter}").trigger("change");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyListAttributeContains(managementEndpoint, address, "security-properties", {
      prop: "val",
    });
  });
});
