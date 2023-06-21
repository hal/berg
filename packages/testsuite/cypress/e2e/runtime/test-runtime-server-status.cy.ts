describe("TESTS: Runtime => Server => Status", () => {
  let managementEndpoint: string;
  let serverHost: string;

  const memoryAddress = ["core-service", "platform-mbean", "type", "memory"];
  const threadingAddress = ["core-service", "platform-mbean", "type", "threading"];
  const heapMemoryUsage = "heap-memory-usage";
  const nonHeapMemoryUsage = "non-heap-memory-usage";

  const usedHeapProgressBarSelector = "#server-runtime-status-heap-used div.progress-bar-success";
  const commitedHeapProgressBarSelector = "#server-runtime-status-heap-committed [class^=progress-bar]";
  const usedNonHeapProgressBarSelector = "#server-runtime-status-non-heap-used div.progress-bar-success";
  const commitedNonHeapProgressBarSelector = "#server-runtime-status-non-heap-committed div.progress-bar-success";
  const threadsProgressBarSelector = "#server-runtime-status-threads div.progress-bar";

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

  beforeEach(() => {
    cy.navigateTo(managementEndpoint, "runtime");
    cy.get(`#standalone-host-${serverHost}`).click();
    cy.get("#server-runtime-status").click();
    cy.get("#hal-finder-preview").should("be.visible");
  });

  it("Read used heap", () => {
    cy.get("#server-runtime-status-heap-used").should("be.visible");
    cy.readAttributeAsObject(managementEndpoint, memoryAddress, heapMemoryUsage).then((result) => {
      const memoryObject = result as {
        init: number;
        used: number;
        committed: number;
        max: number;
      };
      const usedHeapMemory = memoryObject.used / 1024 ** 2;
      const maxMemory = memoryObject.max / 1024 ** 2;
      cy.get(usedHeapProgressBarSelector)
        .invoke("attr", "aria-valuenow")
        .then(($attributeValue) => {
          expect(Number($attributeValue)).to.be.closeTo(usedHeapMemory, 2);
        });
      cy.get(usedHeapProgressBarSelector)
        .invoke("attr", "aria-valuemax")
        .then(($attributeValue) => {
          expect(Number($attributeValue)).to.be.closeTo(maxMemory, 2);
        });
    });
  });

  it("Read commited heap", () => {
    cy.get("#server-runtime-status-heap-committed").should("be.visible");
    cy.readAttributeAsObject(managementEndpoint, memoryAddress, heapMemoryUsage).then((result) => {
      const memoryObject = result as {
        init: number;
        used: number;
        committed: number;
        max: number;
      };
      const commitedHeapMemory = memoryObject.committed / 1024 ** 2;
      const maxMemory = memoryObject.max / 1024 ** 2;
      cy.get(commitedHeapProgressBarSelector)
        .invoke("attr", "aria-valuenow")
        .then(($attributeValue) => {
          expect(Number($attributeValue)).to.be.closeTo(commitedHeapMemory, 1);
        });
      cy.get(commitedHeapProgressBarSelector)
        .invoke("attr", "aria-valuemax")
        .then(($attributeValue) => {
          expect(Number($attributeValue)).to.be.closeTo(maxMemory, 1);
        });
    });
  });

  it("Read used non-heap", () => {
    cy.get("#server-runtime-status-non-heap-used").should("be.visible");
    cy.readAttributeAsObject(managementEndpoint, memoryAddress, nonHeapMemoryUsage).then((result) => {
      const memoryObject = result as {
        init: number;
        used: number;
        committed: number;
        max: number;
      };
      const usedNonHeapMemory = memoryObject.used / 1024 ** 2;
      const maxMemory = memoryObject.max / 1024 ** 2;
      cy.get(usedNonHeapProgressBarSelector)
        .invoke("attr", "aria-valuenow")
        .then(($attributeValue) => {
          expect(Number($attributeValue)).to.be.closeTo(usedNonHeapMemory, 2);
        });
      cy.get(usedNonHeapProgressBarSelector)
        .invoke("attr", "aria-valuemax")
        .then(($attributeValue) => {
          expect(Number($attributeValue)).to.be.closeTo(maxMemory, 2);
        });
    });
  });

  it("Read commited non-heap", () => {
    cy.get("#server-runtime-status-non-heap-committed").should("be.visible");
    cy.readAttributeAsObject(managementEndpoint, memoryAddress, nonHeapMemoryUsage).then((result) => {
      const memoryObject = result as {
        init: number;
        used: number;
        committed: number;
        max: number;
      };
      const commitedNonHeapMemory = memoryObject.committed / 1024 ** 2;
      const maxMemory = memoryObject.max / 1024 ** 2;
      cy.get(commitedNonHeapProgressBarSelector)
        .invoke("attr", "aria-valuenow")
        .then(($attributeValue) => {
          expect(Number($attributeValue)).to.be.closeTo(commitedNonHeapMemory, 1);
        });
      cy.get(commitedNonHeapProgressBarSelector)
        .invoke("attr", "aria-valuemax")
        .then(($attributeValue) => {
          expect(Number($attributeValue)).to.be.closeTo(maxMemory, 1);
        });
    });
  });

  it("Read daemon threads", () => {
    cy.get("#server-runtime-status-threads").scrollIntoView().should("be.visible");
    cy.readAttributeAsNumber(managementEndpoint, threadingAddress, "daemon-thread-count").then((deamonThreads) => {
      cy.readAttributeAsNumber(managementEndpoint, threadingAddress, "thread-count").then((totalThreads) => {
        cy.get(threadsProgressBarSelector)
          .invoke("attr", "aria-valuenow")
          .then(($attributeValue) => {
            expect(Number($attributeValue)).to.be.closeTo(deamonThreads, 1);
          });
        cy.get(threadsProgressBarSelector)
          .invoke("attr", "aria-valuemax")
          .then(($attributeValue) => {
            expect(Number($attributeValue)).to.be.closeTo(totalThreads, 1);
          });
      });
    });
  });
});
