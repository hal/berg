Cypress.Commands.add("createMailSession", (managementEndpoint, mailSession) => {
  cy.addAddress(
    managementEndpoint,
    ["subsystem", "mail", "mail-session", mailSession.mailSessionName],
    {
      "jndi-name": mailSession.jndiName,
    }
  );
});

Cypress.Commands.add(
  "createOutboundSocketBinding",
  (managementEndpoint, socketBinding) => {
    cy.addAddress(
      managementEndpoint,
      [
        "socket-binding-group",
        "standard-sockets",
        "remote-destination-outbound-socket-binding",
        socketBinding.name,
      ],
      socketBinding
    );
  }
);

export {};

declare global {
  namespace Cypress {
    interface Chainable {
      createMailSession(
        managementEndpoint: string,
        mailSession: {
          mailSessionName: string;
          jndiName: string;
        }
      ): Chainable<void>;
      createOutboundSocketBinding(
        managementEndpoint: string,
        outBoundSocketBinding: {
          name: string;
          host: string;
          port: string;
        }
      ): Chainable<void>;
    }
  }
}
