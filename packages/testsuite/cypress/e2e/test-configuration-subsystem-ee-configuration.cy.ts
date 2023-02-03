describe("TESTS: Configuration => Subsystem => EE => Configuration", () => {
  let managementEndpoint: string;

  const address = ["subsystem", "ee"];
  const configurationFormId = "ee-attributes-form";
  const annotationPropertyReplacement = "annotation-property-replacement";
  const earSubdeploymentsIsolated = "ear-subdeployments-isolated";
  const jbossDescriptorPropertyReplacement =
    "jboss-descriptor-property-replacement";
  const specDescriptorPropertyReplacement =
    "spec-descriptor-property-replacement";

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Toggle annotation-property-replacement", () => {
    let value = false;
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: address,
      name: annotationPropertyReplacement,
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "ee");
      cy.get("#ee-attributes-item").click();
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, annotationPropertyReplacement, value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(
        managementEndpoint,
        address,
        annotationPropertyReplacement,
        !value
      );
    });
  });

  it("Toggle ear-subdeployments-isolated", () => {
    let value = false;
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: address,
      name: earSubdeploymentsIsolated,
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "ee");
      cy.get("#ee-attributes-item").click();
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, earSubdeploymentsIsolated, value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(
        managementEndpoint,
        address,
        earSubdeploymentsIsolated,
        !value
      );
    });
  });

  it("Toggle jboss-descriptor-property-replacement", () => {
    let value = false;
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: address,
      name: jbossDescriptorPropertyReplacement,
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "ee");
      cy.get("#ee-attributes-item").click();
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, jbossDescriptorPropertyReplacement, value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(
        managementEndpoint,
        address,
        jbossDescriptorPropertyReplacement,
        !value
      );
    });
  });

  it("Toggle spec-descriptor-property-replacement", () => {
    let value = false;
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: address,
      name: specDescriptorPropertyReplacement,
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "ee");
      cy.get("#ee-attributes-item").click();
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, specDescriptorPropertyReplacement, value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(
        managementEndpoint,
        address,
        specDescriptorPropertyReplacement,
        !value
      );
    });
  });

  it("Reset", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-attributes-item").click();
    cy.resetForm(configurationFormId, managementEndpoint, address);
  });
});
