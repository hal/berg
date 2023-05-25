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
            reload"`
          );
        });
      });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Logs in successfully and logs out by user with role", () => {
    cy.visit(`/?connect=${wildfly}#home`);
    cy.get("#username").type("userwithrole");
    cy.get("#password").type("password");
    cy.get("#kc-login").click();
    cy.verifyUserName("userwithrole");
    cy.verifyUserRole("Administrator");
    cy.logoutFromWebConsole();
    verifyNotLoggedIn(keycloak);
  });

  it("Returns 403 Forbidden for a user without role", () => {
    cy.visit(`/?connect=${wildfly}#home`);
    cy.get("#username").type("userwithoutrole");
    cy.get("#password").type("password");
    cy.get("#kc-login").click();
    cy.verifyErrorMessage("Status 403 - Forbidden.");
  });

  function verifyNotLoggedIn(keycloak: string): void {
    cy.url().should(`include`, keycloak);
    cy.get("#username").should("exist");
    cy.get("#password").should("exist");
    cy.get("#kc-login").should("exist");
  }
});
