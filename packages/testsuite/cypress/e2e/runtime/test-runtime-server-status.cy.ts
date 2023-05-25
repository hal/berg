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
    cy.readAttributeAsObject(
      managementEndpoint,
      ["core-service", "platform-mbean", "type", "memory"],
      "heap-memory-usage"
    ).then((result) => {
      const memoryObject = result as {
        init: number;
        used: number;
        committed: number;
        max: number;
      };
      const usedHeapMemory = memoryObject.used / 1024 ** 2;
      const maxMemory = memoryObject.max / 1024 ** 2;
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
    cy.readAttributeAsObject(
      managementEndpoint,
      ["core-service", "platform-mbean", "type", "memory"],
      "heap-memory-usage"
    ).then((result) => {
      const memoryObject = result as {
        init: number;
        used: number;
        committed: number;
        max: number;
      };
      const commitedHeapMemory = memoryObject.committed / 1024 ** 2;
      const maxMemory = memoryObject.max / 1024 ** 2;
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
    cy.readAttributeAsObject(
      managementEndpoint,
      ["core-service", "platform-mbean", "type", "memory"],
      "non-heap-memory-usage"
    ).then((result) => {
      const memoryObject = result as {
        init: number;
        used: number;
        committed: number;
        max: number;
      };
      const usedNonHeapMemory = memoryObject.used / 1024 ** 2;
      const maxMemory = memoryObject.max / 1024 ** 2;
      cy.get("#server-runtime-status-non-heap-used div.progress-bar-success")
        .invoke("attr", "aria-valuenow")
        .then(($attributeValue) => {
          expect(Number($attributeValue)).to.be.closeTo(usedNonHeapMemory, 1);
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
    cy.readAttributeAsObject(
      managementEndpoint,
      ["core-service", "platform-mbean", "type", "memory"],
      "non-heap-memory-usage"
    ).then((result) => {
      const memoryObject = result as {
        init: number;
        used: number;
        committed: number;
        max: number;
      };
      const commitedNonHeapMemory = memoryObject.committed / 1024 ** 2;
      const maxMemory = memoryObject.max / 1024 ** 2;
      cy.get("#server-runtime-status-non-heap-committed div.progress-bar-success")
        .invoke("attr", "aria-valuenow")
        .then(($attributeValue) => {
          expect(Number($attributeValue)).to.be.closeTo(commitedNonHeapMemory, 1);
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
    cy.readAttributeAsNumber(
      managementEndpoint,
      ["core-service", "platform-mbean", "type", "threading"],
      "daemon-thread-count"
    ).then((deamonThreads) => {
      cy.readAttributeAsNumber(
        managementEndpoint,
        ["core-service", "platform-mbean", "type", "threading"],
        "thread-count"
      ).then((totalThreads) => {
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
