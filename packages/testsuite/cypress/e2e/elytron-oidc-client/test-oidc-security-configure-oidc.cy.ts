describe("TESTS: Access secured by Elytron OIDC client, performed in Web Console", () => {
  const oidcAddress = ["subsystem", "elytron-oidc-client"];
  const providerAddress = ["subsystem", "elytron-oidc-client", "provider", "keycloak"];
  const secureDeploymentAddress = ["subsystem", "elytron-oidc-client", "secure-deployment", "wildfly-management"];
  const secureServerAddress = ["subsystem", "elytron-oidc-client", "secure-server", "wildfly-console"];
  const coreSeviceRbacAddress = ["core-service", "management", "access", "authorization"];
  const mappedRoleAddress = [
    "core-service",
    "management",
    "access",
    "authorization",
    "role-mapping",
    "Administrator",
    "include",
    "user-userwithmappedrole",
  ];
  const optionalFields = "a.field-section-toggle-pf";
  const activationRBACWarning = "#hal-finder-preview > div:nth-child(2) > a";
  const activationRBACWizardWarning = "#hal-modal > div > div > div.modal-body > p > p:nth-child(2)";
  const activationRBACWarningMessage =
    "be sure your configuration has a user who will be mapped to one of the RBAC roles.";
  const providerSelector = "#model-browser-root___provider_anchor";
  const secureDeploymentSelector = "#model-browser-root___secure-deployment_anchor";
  const secureServerSelector = "#model-browser-root___secure-server_anchor";

  let wildfly: string;
  let keycloak: string;

  const providerForm = {
    id: "model-browser-root-provider-add",
    providerName: "name",
    providerValue: "keycloak",
    serverUrl: "provider-url",
    serverUrlValue: `http://localhost:8888/realms/wildfly-infra`,
  };

  const secureDeployment = {
    id: "model-browser-root-secure-deployment-add",
    resource: "name",
    provider: "provider",
    clientId: "client-id",
    principal: "principal-attribute",
    sslRequired: "ssl-required",
    bearerOnly: "bearer-only",
  };

  const secureServer = {
    id: "model-browser-root-secure-server-add",
    resource: "name",
    provider: "provider",
    clientId: "client-id",
    publicClient: "public-client",
  };

  const roleMapping = {
    id: "user-form",
    userName: "name",
    include: "include",
  };

  before(() => {
    cy.startWildflyContainer({ useNetworkHostMode: true }).then((result) => {
      wildfly = result as string;
    });
    cy.startKeycloakContainer().then((result) => {
      keycloak = result as string;
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  beforeEach(() => {
    // required for "flip" method to see all fields in form with a lots of elements
    cy.viewport(1000, 2500);
  });

  it("Navigates to elytron OIDC client configuration", () => {
    cy.navigateTo(wildfly, "home");
    cy.get("#tlc-configuration").click();
    cy.get("#subsystems").click();
    cy.get("#elytron-oidc-client").click();
    cy.get("#elytron-oidc-client > a").click();
    cy.get(providerSelector).should("be.visible");
    cy.get("#model-browser-root___realm_anchor").should("be.visible");
    cy.get(secureDeploymentSelector).should("be.visible");
    cy.get(secureServerSelector).should("be.visible");
  });

  it("Add keycloak provider", () => {
    cy.navigateToGenericSubsystemPage(wildfly, oidcAddress);
    cy.get(providerSelector).click();
    cy.addInTable("model-browser-children-table");
    cy.text(providerForm.id, providerForm.providerName, providerForm.providerValue);
    cy.get(optionalFields).click();
    cy.text(providerForm.id, providerForm.serverUrl, `${keycloak}/realms/wildfly-infra`);
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.verifyAttribute(wildfly, providerAddress, providerForm.serverUrl, `${keycloak}/realms/wildfly-infra`);
  });

  it("Configure management client secured by bearer token", () => {
    cy.navigateToGenericSubsystemPage(wildfly, oidcAddress);
    cy.get(secureDeploymentSelector).click();
    cy.addInTable("model-browser-children-table");
    cy.text(secureDeployment.id, secureDeployment.resource, "wildfly-management");
    cy.get(optionalFields).click();
    cy.selectText(secureDeployment.id, secureDeployment.sslRequired, "EXTERNAL");
    cy.text(secureDeployment.id, secureDeployment.principal, "preferred_username");
    cy.text(secureDeployment.id, secureDeployment.provider, "keycloak");
    cy.text(secureDeployment.id, secureDeployment.clientId, "wildfly-management");
    cy.flip(secureDeployment.id, secureDeployment.bearerOnly, false);
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.verifyAttribute(wildfly, secureDeploymentAddress, secureDeployment.sslRequired, "EXTERNAL");
    cy.verifyAttribute(wildfly, secureDeploymentAddress, secureDeployment.principal, "preferred_username");
    cy.verifyAttribute(wildfly, secureDeploymentAddress, secureDeployment.provider, "keycloak");
    cy.verifyAttribute(wildfly, secureDeploymentAddress, secureDeployment.clientId, "wildfly-management");
    cy.verifyAttribute(wildfly, secureDeploymentAddress, secureDeployment.bearerOnly, true);
  });

  it("Configure web console secured by OIDC client", () => {
    cy.navigateToGenericSubsystemPage(wildfly, oidcAddress);
    cy.get(secureServerSelector).click();
    cy.addInTable("model-browser-children-table");
    cy.text(secureServer.id, secureServer.resource, "wildfly-console");
    cy.get(optionalFields).click();
    cy.text(secureServer.id, secureServer.provider, "keycloak");
    cy.text(secureServer.id, secureServer.clientId, "wildfly-console");
    cy.flip(secureServer.id, secureServer.publicClient, false);
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.verifyAttribute(wildfly, secureServerAddress, secureServer.provider, "keycloak");
    cy.verifyAttribute(wildfly, secureServerAddress, secureServer.clientId, "wildfly-console");
    cy.verifyAttribute(wildfly, secureServerAddress, secureServer.publicClient, true);
  });

  it("Enable RBAC for OIDC provider in web console", () => {
    cy.navigateTo(wildfly, "home");
    cy.get("#tlc-access-control").click();
    cy.get(activationRBACWarning).should("have.text", "Enable RBAC").click();
    cy.get("#hal-modal-title").should("have.text", "Switch Provider");
    cy.get(activationRBACWizardWarning).should("contain.text", activationRBACWarningMessage);
    cy.confirmYesInWizard();
    cy.verifySuccess();
    cy.verifyAttribute(wildfly, coreSeviceRbacAddress, "provider", "rbac");
    cy.verifyAttribute(wildfly, coreSeviceRbacAddress, "use-identity-roles", true);
  });

  it("Assign EAP role to user from SSO", () => {
    cy.navigateTo(wildfly, "home");
    cy.get("#tlc-access-control").should("have.text", "Access Control").click();
    cy.get("#access-control-browse-by-users").should("have.text", "Users").click();
    cy.get("#role-add").click();
    cy.text(roleMapping.id, roleMapping.userName, "userwithmappedrole");
    cy.text(roleMapping.id, roleMapping.include, "Administrator");
    cy.get("body > div:nth-child(10)").click();
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.verifyAttribute(wildfly, mappedRoleAddress, roleMapping.userName, "userwithmappedrole");
  });

  // this test is dependent on all previous tests. It verify whole configuration together.
  it("Secured access by Elytron OIDC client", () => {
    // the following two CLI commands are needed to secure server because is used unsecured configuration at start.
    cy.executeInWildflyContainer(
      `"/core-service=management/management-interface=http-interface:write-attribute(name=http-authentication-factory,value=management-http-authentication),
        /core-service=management/management-interface=http-interface:write-attribute(name=http-upgrade,value={sasl-authentication-factory=management-sasl-authentication,enabled=true}),
        reload"`
    );
    cy.visit(`/?connect=${wildfly}#home`);
    cy.origin(keycloak, () => {
      cy.get("#username").type("userwithrole");
      cy.get("#password").type("password");
      cy.get("#kc-login").click();
    });
    cy.verifyUserName("userwithrole");
    cy.get("#tlc-access-control").should("have.text", "Access Control");
  });
});
