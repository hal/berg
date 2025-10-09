describe("TESTS: Runtime => Server => Open Ports", () => {
  let managementEndpoint: string;
  let serverHost: string;

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
      cy.readAttributeAsString(managementEndpoint, [], "name").then((result) => {
        serverHost = result;
      });
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Read open ports", () => {
    cy.navigateTo(managementEndpoint, "runtime");
    cy.get(`#standalone-host-${serverHost}`).click();
    cy.get("#hal-finder-preview").should("be.visible");
    cy.get("#h2-open-ports").should("be.visible");
    cy.readAttributeAsObjectList(
      `${managementEndpoint}/management`,
      ["socket-binding-group", "standard-sockets", "socket-binding", "*"],
      "bound-port",
    ).then((objects) => {
      const boundPorts = objects
        .map((obj) => {
          const portNumber = (obj as { result: number }).result;
          const address = (
            obj as {
              address: {
                "socket-binding-group"?: string;
                "socket-binding"?: string;
              }[];
            }
          ).address;
          return {
            port: portNumber,
            address: address,
          };
        })
        .map((res) => {
          return {
            port: res.port,
            portName: res.address[1]["socket-binding"],
          };
        });
      cy.get("#open-ports li.list-group-item").should("have.length", boundPorts.length);
      boundPorts.forEach((boundPort) => {
        cy.get(`#open-ports span.value:contains("${boundPort.port}")`).should("exist");
      });
    });
  });
});
