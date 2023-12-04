describe("TESTS: Access secured by Elytron OIDC client with RBAC", () => {
  let wildfly: string;
  let keycloak: string;

  before(() => {
    cy.startWildflyContainerSecured()
      .then((result) => {
        wildfly = result as string;
        console.log(wildfly);
      })
      .then(() => {
        cy.startKeycloakContainer().then((result) => {
          keycloak = result as string;
          // the following CLI commands secure the web-console by OIDC, with RBAC enabled
          cy.executeInWildflyContainer(
            `"/subsystem=elytron-oidc-client/provider=keycloak:add(provider-url=${keycloak}/realms/wildfly-infra),
            /subsystem=elytron-oidc-client/secure-deployment=wildfly-management:add(provider=keycloak,client-id=wildfly-management,principal-attribute=preferred_username,bearer-only=true,ssl-required=EXTERNAL),
            /subsystem=elytron-oidc-client/secure-server=wildfly-console:add(provider=keycloak,client-id=wildfly-console,public-client=true),
            /core-service=management/access=authorization:write-attribute(name=provider,value=rbac),
            /core-service=management/access=authorization:write-attribute(name=use-identity-roles,value=true),
            /core-service=management/access=authorization/role-mapping=Administrator:add(),
            /core-service=management/access=authorization/role-mapping=Administrator/include=userwithmappedrole:add(name=userwithmappedrole,type=USER),
            reload"`
          );
        });
      });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Logs in successfully and logs out by user with role", () => {
    logIn("userwithrole", "password");
    cy.get("#tlc-access-control").should("have.text", "Access Control");
    cy.verifyUserName("userwithrole");
    cy.verifyUserRole("Administrator");
    cy.logoutFromWebConsole();
    verifyNotLoggedIn(keycloak);
  });

  it("Logs in successfully and logs out by user with letter case insensiteve role", () => {
    logIn("userwithrolelettercaseinsensitive", "password");
    cy.get("#tlc-access-control").should("have.text", "Access Control");
    cy.verifyUserName("userwithrolelettercaseinsensitive");
    cy.verifyUserRole("aDmInIsTrAtOr");
    cy.logoutFromWebConsole();
    verifyNotLoggedIn(keycloak);
  });

  it("Logs in successfully and logs out by user without admins role", () => {
    logIn("userwithnoadminrole", "password");
    cy.get("#tlc-access-control").should("not.exist");
    cy.verifyUserName("userwithnoadminrole");
    cy.verifyUserRole("Auditor");
    cy.verifyUserRole("Deployer");
    cy.verifyUserRole("Maintainer");
    cy.verifyUserRole("Monitor");
    cy.verifyUserRole("Operator");
    cy.logoutFromWebConsole();
    verifyNotLoggedIn(keycloak);
  });

  it("Returns 403 Forbidden for a user without role", () => {
    logIn("userwithoutrole", "password");
    cy.verifyErrorMessage("Status 403 - Forbidden.");
  });

  it("Authenticate a user with role mapping in EAP", () => {
    logIn("userwithmappedrole", "password");
    cy.get("#tlc-access-control").should("have.text", "Access Control");
    cy.verifyUserName("userwithmappedrole");
    cy.verifyUserRole("Administrator");
    cy.logoutFromWebConsole();
    verifyNotLoggedIn(keycloak);
  });

  it("Returns 403 forbidden for user with exclude role mapping in EAP", () => {
    logIn("userwithexcludedrole", "password");
    cy.get("#tlc-access-control").should("have.text", "Access Control");
    cy.verifyUserName("userwithexcludedrole");
    cy.verifyUserRole("Administrator");
    cy.logoutFromWebConsole();
    verifyNotLoggedIn(keycloak);
    cy.executeInWildflyContainer(
      `"/core-service=management/access=authorization/role-mapping=Administrator/exclude=userwithexcludedrole:add(name=userwithexcludedrole,type=USER),
      reload"`
    ).then(() => {
      logIn("userwithexcludedrole", "password");
      cy.verifyErrorMessage("Status 403 - Forbidden.");
    });
  });

  function logIn(login: string, password: string) {
    cy.visit(`/?connect=${wildfly}#home`);
    cy.origin(keycloak, {args: {login: login, password: password}} , 
      ({login: login, password: password}) => {
        cy.get("#username").type(login);
        cy.get("#password").type(password);
        cy.get("#kc-login").click();
    });
  }

  function verifyNotLoggedIn(keycloak: string): void {
    cy.url().should(`include`, keycloak);
    cy.get("#username").should("exist");
    cy.get("#password").should("exist");
    cy.get("#kc-login").should("exist");
  }
});
