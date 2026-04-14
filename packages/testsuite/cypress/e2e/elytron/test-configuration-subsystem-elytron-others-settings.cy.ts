describe("TESTS: Configuration => Subsystem => Security => Settings => Global Settings", () => {
  let managementEndpoint: string;

  const address = ["subsystem", "elytron", "security-domain", "ApplicationDomain"];

  const navigation = {
    sslButton: "#ssl-item",
    securityDomainButton: "#elytron-security-domain-item",
    securityDomainRealmsButton: "#hal-uid-5",
  };

  const realmsForm = {
    id: "elytron-security-domain-realms-add",
    addButton: "elytron-security-domain-realms-table",
    principalTransformer: {
      id: "#elytron-security-domain-realms-add-editing > div:nth-child(2)",
      text: "Principal Transformer",
    },
    roleDecoder: {
      id: "#elytron-security-domain-realms-add-editing > div:nth-child(3)",
      name: "role-decoder",
      text: "Role Decoder",
      value: "groups-to-roles",
    },
    roleMapper: {
      id: "#elytron-security-domain-realms-add-editing > div:nth-child(4)",
      name: "role-mapper",
      text: "Role Mapper",
      value: "super-user-mapper",
    },
    realm: {
      id: "#elytron-security-domain-realms-add-editing > div:nth-child(5)",
      name: "realm",
      text: "Realm",
      value: "ManagementRealm",
    },
    expectedResult: { "role-decoder": "groups-to-roles", "role-mapper": "super-user-mapper", realm: "ManagementRealm" },
  };

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Add realm to Security Domain", () => {
    cy.navigateTo(managementEndpoint, "elytron-other");
    cy.get(navigation.sslButton).click();
    cy.get(navigation.securityDomainButton).click();
    cy.get(navigation.securityDomainRealmsButton).click();
    cy.addInTable(realmsForm.addButton);
    cy.get(realmsForm.principalTransformer.id)
      .should("be.visible")
      .should("contain.text", realmsForm.principalTransformer.text);
    cy.get(realmsForm.roleDecoder.id).should("be.visible").should("contain.text", realmsForm.roleDecoder.text);
    cy.get(realmsForm.roleMapper.id).should("be.visible").should("contain.text", realmsForm.roleMapper.text);
    cy.get(realmsForm.realm.id).should("be.visible").should("contain.text", realmsForm.realm.text);
    cy.text(realmsForm.id, realmsForm.roleDecoder.name, realmsForm.roleDecoder.value);
    cy.text(realmsForm.id, realmsForm.roleMapper.name, realmsForm.roleMapper.value);
    cy.text(realmsForm.id, realmsForm.realm.name, realmsForm.realm.value);
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.verifyListAttributeContains(managementEndpoint, address, "realms", realmsForm.expectedResult);
  });
});
