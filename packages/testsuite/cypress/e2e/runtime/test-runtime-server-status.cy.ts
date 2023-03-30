describe("TESTS: Runtime => Server => Status", () => {
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

  beforeEach(() => {
    cy.navigateTo(managementEndpoint, "runtime");
    cy.get(`#standalone-host-${serverHost}`).click();
    cy.get("#server-runtime-status").click();
    cy.get("#hal-finder-preview").should("be.visible");
  });

  it("Read used heap", () => {
    cy.get("#server-runtime-status-heap-used").should("be.visible");
    cy.task("execute:cli", {
      managementApi: `${managementEndpoint}/management`,
      operation: "read-attribute",
      address: ["core-service", "platform-mbean", "type", "memory"],
      name: "heap-memory-usage",
    }).then((result) => {
      let usedHeapMemory =
        (
          result as {
            result: {
              init: number;
              used: number;
              committed: number;
              max: number;
            };
          }
        ).result.used /
        1024 ** 2;
      let maxMemory =
        (
          result as {
            result: {
              init: number;
              used: number;
              committed: number;
              max: number;
            };
          }
        ).result.max /
        1024 ** 2;
      cy.get("#server-runtime-status-heap-used div.progress-bar-success")
        .invoke("attr", "aria-valuenow")
        .then(($attributeValue) => {
          expect(Number($attributeValue)).to.be.closeTo(usedHeapMemory, 1);
        });
      cy.get("#server-runtime-status-heap-used div.progress-bar-success")
        .invoke("attr", "aria-valuemax")
        .then(($attributeValue) => {
          expect(Number($attributeValue)).to.be.closeTo(maxMemory, 1);
        });
    });
  });

  it("Read commited heap", () => {
    cy.get("#server-runtime-status-heap-committed").should("be.visible");
    cy.task("execute:cli", {
      managementApi: `${managementEndpoint}/management`,
      operation: "read-attribute",
      address: ["core-service", "platform-mbean", "type", "memory"],
      name: "heap-memory-usage",
    }).then((result) => {
      let commitedHeapMemory =
        (
          result as {
            result: {
              init: number;
              used: number;
              committed: number;
              max: number;
            };
          }
        ).result.committed /
        1024 ** 2;
      let maxMemory =
        (
          result as {
            result: {
              init: number;
              used: number;
              committed: number;
              max: number;
            };
          }
        ).result.max /
        1024 ** 2;
      cy.get("#server-runtime-status-heap-committed div.progress-bar-success")
        .invoke("attr", "aria-valuenow")
        .then(($attributeValue) => {
          expect(Number($attributeValue)).to.be.closeTo(commitedHeapMemory, 1);
        });
      cy.get("#server-runtime-status-heap-committed div.progress-bar-success")
        .invoke("attr", "aria-valuemax")
        .then(($attributeValue) => {
          expect(Number($attributeValue)).to.be.closeTo(maxMemory, 1);
        });
    });
  });

  it("Read used non-heap", () => {
    cy.get("#server-runtime-status-non-heap-used").should("be.visible");
    cy.task("execute:cli", {
      managementApi: `${managementEndpoint}/management`,
      operation: "read-attribute",
      address: ["core-service", "platform-mbean", "type", "memory"],
      name: "non-heap-memory-usage",
    }).then((result) => {
      let usedHeapMemory =
        (
          result as {
            result: {
              init: number;
              used: number;
              committed: number;
              max: number;
            };
          }
        ).result.used /
        1024 ** 2;
      let maxMemory =
        (
          result as {
            result: {
              init: number;
              used: number;
              committed: number;
              max: number;
            };
          }
        ).result.max /
        1024 ** 2;
      cy.get("#server-runtime-status-non-heap-used div.progress-bar-success")
        .invoke("attr", "aria-valuenow")
        .then(($attributeValue) => {
          expect(Number($attributeValue)).to.be.closeTo(usedHeapMemory, 1);
        });
      cy.get("#server-runtime-status-non-heap-used div.progress-bar-success")
        .invoke("attr", "aria-valuemax")
        .then(($attributeValue) => {
          expect(Number($attributeValue)).to.be.closeTo(maxMemory, 1);
        });
    });
  });

  it("Read commited non-heap", () => {
    cy.get("#server-runtime-status-non-heap-committed").should("be.visible");
    cy.task("execute:cli", {
      managementApi: `${managementEndpoint}/management`,
      operation: "read-attribute",
      address: ["core-service", "platform-mbean", "type", "memory"],
      name: "non-heap-memory-usage",
    }).then((result) => {
      let commitedHeapMemory =
        (
          result as {
            result: {
              init: number;
              used: number;
              committed: number;
              max: number;
            };
          }
        ).result.committed /
        1024 ** 2;
      let maxMemory =
        (
          result as {
            result: {
              init: number;
              used: number;
              committed: number;
              max: number;
            };
          }
        ).result.max /
        1024 ** 2;
      cy.get("#server-runtime-status-non-heap-committed div.progress-bar-success")
        .invoke("attr", "aria-valuenow")
        .then(($attributeValue) => {
          expect(Number($attributeValue)).to.be.closeTo(commitedHeapMemory, 1);
        });
      cy.get("#server-runtime-status-non-heap-committed div.progress-bar-success")
        .invoke("attr", "aria-valuemax")
        .then(($attributeValue) => {
          expect(Number($attributeValue)).to.be.closeTo(maxMemory, 1);
        });
    });
  });

  it("Read daemon threads", () => {
    cy.get("#server-runtime-status-threads").scrollIntoView().should("be.visible");
    let deamonThreads: number;
    let totalThreads: number;
    cy.task("execute:cli", {
      managementApi: `${managementEndpoint}/management`,
      operation: "read-attribute",
      address: ["core-service", "platform-mbean", "type", "threading"],
      name: "daemon-thread-count",
    }).then((result) => {
      deamonThreads = (result as { result: number }).result;
      cy.task("execute:cli", {
        managementApi: `${managementEndpoint}/management`,
        operation: "read-attribute",
        address: ["core-service", "platform-mbean", "type", "threading"],
        name: "thread-count",
      }).then((result) => {
        totalThreads = (result as { result: number }).result;
        cy.get("#server-runtime-status-threads div.progress-bar")
          .invoke("attr", "aria-valuenow")
          .then(($attributeValue) => {
            expect(Number($attributeValue)).to.be.closeTo(deamonThreads, 1);
          });
        cy.get("#server-runtime-status-threads div.progress-bar")
          .invoke("attr", "aria-valuemax")
          .then(($attributeValue) => {
            expect(Number($attributeValue)).to.be.closeTo(totalThreads, 1);
          });
      });
    });
  });
});
