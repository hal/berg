describe("TESTS: Access secured by Elytron OIDC client", () => {
  let wildfly: string;
  let keycloak: string;

  before(() => {
    cy.startWildflyContainerSecured()
      .then((result) => {
        wildfly = result as string;
      })
      .then(() => {
        cy.startKeycloakContainer().then((result) => {
          keycloak = result as string;
          // the following CLI commands setup the OIDC configuration
          cy.executeInWildflyContainer(
            `"/subsystem=elytron-oidc-client/provider=keycloak:add(provider-url=${keycloak}/realms/wildfly-infra),
            /subsystem=elytron-oidc-client/secure-deployment=wildfly-management:add(provider=keycloak,client-id=wildfly-management,principal-attribute=preferred_username,bearer-only=true,ssl-required=EXTERNAL),
            /subsystem=elytron-oidc-client/secure-server=wildfly-console:add(provider=keycloak,client-id=wildfly-console,public-client=true),
            reload"`
          );
        });
      });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Logs in successfully and logs out", () => {
    cy.visit(`?connect=${wildfly}#home`);
    cy.get("#username").type("userwithoutrole");
    cy.get("#password").type("password");
    cy.get("#kc-login").click();
    cy.url().should(`include`, `localhost:${Cypress.env("HAL_CONTAINER_PORT") as string}`);
    cy.verifyUserName("userwithoutrole");
    cy.logoutFromWebConsole();
    verifyNotLoggedIn(keycloak);
  });

  it("Fails to log in with bad credentials", () => {
    cy.visit(`?connect=${wildfly}#home`);
    cy.get("#username").type("userwithoutrole");
    cy.get("#password").type("wrongPassword");
    cy.get("#kc-login").click();
    verifyNotLoggedIn(keycloak);
  });

  function verifyNotLoggedIn(keycloak: string): void {
    cy.url().should(`include`, keycloak);
    cy.get("#username").should("exist");
    cy.get("#password").should("exist");
    cy.get("#kc-login").should("exist");
  }
});
