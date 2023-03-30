describe("TESTS: Runtime => Server => Open Ports", () => {
  let managementEndpoint: string;
  let serverHost: string;

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
      cy.task("execute:cli", {
        managementApi: managementEndpoint + "/management",
        operation: "read-attribute",
        address: [],
        name: "name",
      }).then((result) => {
        serverHost = (result as { result: string }).result;
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
    cy.task("execute:cli", {
      managementApi: `${managementEndpoint}/management`,
      operation: "read-attribute",
      address: ["socket-binding-group", "standard-sockets", "socket-binding", "*"],
      name: "bound-port",
    }).then((result) => {
      let boundPorts = (
        result as {
          result: [
            {
              result: number;
              outcome: string;
              address: {
                "socket-binding-group"?: string;
                "socket-binding"?: string;
              }[];
            }
          ];
        }
      ).result.map((res) => {
        return {
          port: res.result,
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
