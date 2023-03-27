describe("TESTS: Configuration => Subsystem => EE => Services => Scheduled Executor", () => {
  let managementEndpoint: string;

  const configurationFormId = "ee-service-scheduled-executor-form";
  const managedScheduledExecutorServiceTableId = "ee-service-scheduled-executor-table";

  const contextServices = {
    update: {
      name: "context-service-to-update",
      "jndi-name": "java:jboss/jndiToUpdate",
    },
  };

  const scheduledExecutors = {
    create: {
      name: "managed-scheduled-executor-service-to-create",
      "jndi-name": "java:jboss/msesToCreate",
    },
    update: {
      name: "managed-scheduled-executor-service-to-update",
      "jndi-name": "java:jboss/messToUpdate",
    },
    reset: {
      name: "managed-scheduled-executor-service-to-reset",
      "jndi-name": "java:jboss/msesToReset",
    },
    remove: {
      name: "managed-scheduled-executor-service-to-remove",
      "jndi-name": "java:jboss/msesToRemove",
    },
  };

  before(() => {
    cy.startWildflyContainer()
      .then((result) => {
        managementEndpoint = result as string;
      })
      .then(() => {
        cy.addAddress(managementEndpoint, ["subsystem", "ee", "context-service", contextServices.update.name], {
          "jndi-name": contextServices.update["jndi-name"],
        });
        cy.addAddress(
          managementEndpoint,
          ["subsystem", "ee", "managed-scheduled-executor-service", scheduledExecutors.update.name],
          {
            "jndi-name": scheduledExecutors.update["jndi-name"],
          }
        );
        cy.addAddress(
          managementEndpoint,
          ["subsystem", "ee", "managed-scheduled-executor-service", scheduledExecutors.reset.name],
          {
            "jndi-name": scheduledExecutors.reset["jndi-name"],
          }
        );
        cy.addAddress(
          managementEndpoint,
          ["subsystem", "ee", "managed-scheduled-executor-service", scheduledExecutors.remove.name],
          {
            "jndi-name": scheduledExecutors.remove["jndi-name"],
          }
        );
      });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Create Scheduled Executor", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-scheduled-executor").click();
    cy.addInTable(managedScheduledExecutorServiceTableId);
    cy.text("ee-service-scheduled-executor-add", "name", scheduledExecutors.create.name);
    cy.text("ee-service-scheduled-executor-add", "jndi-name", scheduledExecutors.create["jndi-name"]);
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.validateAddress(
      managementEndpoint,
      ["subsystem", "ee", "managed-scheduled-executor-service", scheduledExecutors.create.name],
      true
    );
  });

  it("Reset", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-scheduled-executor").click();
    cy.selectInTable(managedScheduledExecutorServiceTableId, scheduledExecutors.reset.name);
    cy.resetForm(configurationFormId, managementEndpoint, [
      "subsystem",
      "ee",
      "managed-scheduled-executor-service",
      scheduledExecutors.reset.name,
    ]);
  });

  it("Remove Scheduled Executor", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-scheduled-executor").click();
    cy.removeFromTable(managedScheduledExecutorServiceTableId, scheduledExecutors.remove.name);
    cy.verifySuccess();
    cy.validateAddress(
      managementEndpoint,
      ["subsystem", "ee", "managed-scheduled-executor-service", scheduledExecutors.remove.name],
      false
    );
  });

  it("Edit context-service", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-scheduled-executor").click();
    cy.selectInTable(managedScheduledExecutorServiceTableId, scheduledExecutors.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "context-service", contextServices.update.name);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      ["subsystem", "ee", "managed-scheduled-executor-service", scheduledExecutors.update.name],
      "context-service",
      contextServices.update.name
    );
  });

  it("Edit core-threads", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-scheduled-executor").click();
    cy.selectInTable(managedScheduledExecutorServiceTableId, scheduledExecutors.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "core-threads", "3");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      ["subsystem", "ee", "managed-scheduled-executor-service", scheduledExecutors.update.name],
      "core-threads",
      3
    );
  });

  it("Edit hung-task-termination-period", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-scheduled-executor").click();
    cy.selectInTable(managedScheduledExecutorServiceTableId, scheduledExecutors.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "hung-task-termination-period", "3000");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      ["subsystem", "ee", "managed-scheduled-executor-service", scheduledExecutors.update.name],
      "hung-task-termination-period",
      3000
    );
  });

  it("Edit hung-task-threshold", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-scheduled-executor").click();
    cy.selectInTable(managedScheduledExecutorServiceTableId, scheduledExecutors.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "hung-task-threshold", "3000");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      ["subsystem", "ee", "managed-scheduled-executor-service", scheduledExecutors.update.name],
      "hung-task-threshold",
      3000
    );
  });

  it("Edit jndi-name", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-scheduled-executor").click();
    cy.selectInTable(managedScheduledExecutorServiceTableId, scheduledExecutors.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "jndi-name", "java:jboss/updatedJndiName");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      ["subsystem", "ee", "managed-scheduled-executor-service", scheduledExecutors.update.name],
      "jndi-name",
      "java:jboss/updatedJndiName"
    );
  });

  it("Edit keepalive-time", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-scheduled-executor").click();
    cy.selectInTable(managedScheduledExecutorServiceTableId, scheduledExecutors.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "keepalive-time", "3000");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      ["subsystem", "ee", "managed-scheduled-executor-service", scheduledExecutors.update.name],
      "keepalive-time",
      3000
    );
  });

  it("Toggle long-running-tasks", () => {
    let value = false;
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: ["subsystem", "ee", "managed-scheduled-executor-service", scheduledExecutors.update.name],
      name: "long-running-tasks",
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "ee");
      cy.get("#ee-services-item").click();
      cy.get("#ee-service-scheduled-executor").click();
      cy.selectInTable(managedScheduledExecutorServiceTableId, scheduledExecutors.update.name);
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, "long-running-tasks", value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(
        managementEndpoint,
        ["subsystem", "ee", "managed-scheduled-executor-service", scheduledExecutors.update.name],
        "long-running-tasks",
        !value
      );
    });
  });

  it("Edit reject-policy", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-scheduled-executor").click();
    cy.selectInTable(managedScheduledExecutorServiceTableId, scheduledExecutors.update.name);
    cy.editForm(configurationFormId);
    cy.formInput(configurationFormId, "reject-policy").select("RETRY_ABORT", {
      force: true,
    });
    cy.formInput(configurationFormId, "reject-policy").trigger("change", {
      force: true,
    });
    cy.formInput(configurationFormId, "reject-policy").should("have.value", "RETRY_ABORT");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      ["subsystem", "ee", "managed-scheduled-executor-service", scheduledExecutors.update.name],
      "reject-policy",
      "RETRY_ABORT"
    );
  });

  it("Edit thread-priority", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-scheduled-executor").click();
    cy.selectInTable(managedScheduledExecutorServiceTableId, scheduledExecutors.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "thread-priority", "3");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      ["subsystem", "ee", "managed-scheduled-executor-service", scheduledExecutors.update.name],
      "thread-priority",
      3
    );
  });
});
