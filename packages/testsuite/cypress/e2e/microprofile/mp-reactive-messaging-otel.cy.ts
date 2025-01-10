describe("TESTS: Configuration => Subsystem => Undertow => Global settings", () => {
    let managementEndpoint: string;

    // workaround for JBEAP-28819 - form id is not the base for edit btn id ad so on.
    function editFormJBEAP28819(formId: string) {
        const editButton = "#" + formId + ' a.clickable[data-operation="edit"]';
        const formIdWithSingleDash = formId.replace(/-+/g, "-")
        cy.get(`#${formIdWithSingleDash}-editing`).should("not.be.visible");
        cy.get(editButton).click();
        // Workaround - JBEAP-25005,JBEAP-25046 - the form is sometimes not loaded in time and Cypress is not able to recover
        // from such state and click the button. Waiting does not help, but multiple manual checks for the visibility
        // of the button do. Note that the button is clicked just one time (probably) once visible.
        for (let reClickTry = 0; reClickTry < 5; reClickTry++) {
          cy.get(editButton).then(($button) => {
            if ($button.is(":visible")) {
              cy.get(editButton).click();
            }
          });
        }
        // workaround - end
        cy.get(`#${formIdWithSingleDash}-editing`).should("be.visible");
    }

    const mpRmSrSelectors = {
      otelTracing: "#model-browser-root___opentelemetry-tracing",
      config: "#model-browser-root___opentelemetry-tracing___config",
    }

    const configForm = {
      id: "model-browser-model-browser-root---opentelemetry-tracing---config-form",
      idNoDash: "model-browser-model-browser-root-opentelemetry-tracing-config-form",
      amqpConnector: "amqp-connector",
      kafkaConnector: "kafka-connector",
    };

    const verifyAddress = ["subsystem", "microprofile-reactive-messaging-smallrye", "opentelemetry-tracing", "config"]

    before(() => {
      cy.startWildflyContainer()
        .then((result) => {
          managementEndpoint = result as string;
        })
        .then(() => {
            cy.executeInWildflyContainer(
                `"/extension=org.wildfly.extension.microprofile.reactive-streams-operators-smallrye:add(),
                /extension=org.wildfly.extension.microprofile.reactive-messaging-smallrye:add(),
                /extension=org.wildfly.extension.microprofile.telemetry:add(),
                /extension=org.wildfly.extension.opentelemetry:add(),
                /subsystem=microprofile-reactive-streams-operators-smallrye:add(),
                /subsystem=microprofile-reactive-messaging-smallrye:add(),
                /subsystem=opentelemetry:add(),
                /subsystem=microprofile-telemetry:add(),
                /subsystem=microprofile-reactive-messaging-smallrye/opentelemetry-tracing=config:add(),
                reload"`
            );
        });
    });

    after(() => {
      cy.task("stop:containers");
    });

    beforeEach(() => {
      cy.navigateTo(managementEndpoint, "generic-subsystem;address=%255C0subsystem%255C2microprofile-reactive-messaging-smallrye");
      // the form takes a brief moment to initialize
      cy.wait(200);
      cy.get(mpRmSrSelectors.otelTracing).dblclick();
      cy.get(mpRmSrSelectors.config).click();
    });

    it("Set AMQP to undefined", () => {
        editFormJBEAP28819(configForm.id);
        cy.selectInDropdownMenu(configForm.idNoDash, configForm.amqpConnector, "");
        cy.saveForm(configForm.idNoDash);
        cy.verifyAttribute(
          managementEndpoint,
          verifyAddress,
          "amqp-connector",
          "NEVER"
        );
    });

    it("Set AMQP to NEVER", () => {
        editFormJBEAP28819(configForm.id);
        cy.selectInDropdownMenu(configForm.idNoDash, configForm.amqpConnector, "NEVER");
        cy.saveForm(configForm.idNoDash);
        cy.verifyAttribute(
          managementEndpoint,
          verifyAddress,
          "amqp-connector",
          "NEVER"
        );
    });

    it("Set AMQP to OFF", () => {
        editFormJBEAP28819(configForm.id);
        cy.selectInDropdownMenu(configForm.idNoDash, configForm.amqpConnector, "OFF");
        cy.saveForm(configForm.idNoDash);
        cy.verifyAttribute(
          managementEndpoint,
          verifyAddress,
          "amqp-connector",
          "OFF"
        );
    });

    it("Set AMQP to ON", () => {
        editFormJBEAP28819(configForm.id);
        cy.selectInDropdownMenu(configForm.idNoDash, configForm.amqpConnector, "ON");
        cy.saveForm(configForm.idNoDash);
        cy.verifyAttribute(
          managementEndpoint,
          verifyAddress,
          "amqp-connector",
          "ON"
        );
    });

    it("Set AMQP to ALWAYS", () => {
        editFormJBEAP28819(configForm.id);
        cy.selectInDropdownMenu(configForm.idNoDash, configForm.amqpConnector, "ALWAYS");
        cy.saveForm(configForm.idNoDash);
        cy.verifyAttribute(
          managementEndpoint,
          verifyAddress,
          "amqp-connector",
          "ALWAYS"
        );
    });

    it("Set Kafka to undefined", () => {
        editFormJBEAP28819(configForm.id);
        cy.selectInDropdownMenu(configForm.idNoDash, configForm.kafkaConnector, "");
        cy.saveForm(configForm.idNoDash);
        cy.verifyAttribute(
          managementEndpoint,
          verifyAddress,
          "kafka-connector",
          "NEVER"
        );
    });

    it("Set Kafka to NEVER", () => {
        editFormJBEAP28819(configForm.id);
        cy.selectInDropdownMenu(configForm.idNoDash, configForm.kafkaConnector, "NEVER");
        cy.saveForm(configForm.idNoDash);
        cy.verifyAttribute(
          managementEndpoint,
          verifyAddress,
          "kafka-connector",
          "NEVER"
        );
    });

    it("Set Kafka to OFF", () => {
        editFormJBEAP28819(configForm.id);
        cy.selectInDropdownMenu(configForm.idNoDash, configForm.kafkaConnector, "OFF");
        cy.saveForm(configForm.idNoDash);
        cy.verifyAttribute(
          managementEndpoint,
          verifyAddress,
          "kafka-connector",
          "OFF"
        );
    });

    it("Set Kafka to ON", () => {
        editFormJBEAP28819(configForm.id);
        cy.selectInDropdownMenu(configForm.idNoDash, configForm.kafkaConnector, "ON");
        cy.saveForm(configForm.idNoDash);
        cy.verifyAttribute(
          managementEndpoint,
          verifyAddress,
          "kafka-connector",
          "ON"
        );
    });

    it("Set Kafka to ALWAYS", () => {
        editFormJBEAP28819(configForm.id);
        cy.selectInDropdownMenu(configForm.idNoDash, configForm.kafkaConnector, "ALWAYS");
        cy.saveForm(configForm.idNoDash);
        cy.verifyAttribute(
          managementEndpoint,
          verifyAddress,
          "kafka-connector",
          "ALWAYS"
        );
    });
  });
