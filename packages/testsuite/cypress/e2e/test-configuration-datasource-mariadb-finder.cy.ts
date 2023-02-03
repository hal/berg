import {
  AddModuleCommandBuilder,
  AddDataSourceBuilder,
  AddXADataSourceBuilder,
} from "@berg/commands";

describe("TESTS: Configuration => Datasource => MariaDB (Finder)", () => {
  const mariadbUser = "admin";
  const mariadbPassword = "pass";
  const mariadbDatabaseName = "sampledb";

  const mariadbDriver = "mariadb";
  const mariadbDriverModuleName = "org.mariadb";
  const mariadbContainerName = "mariadb";

  const mariadbDefaultXADS = {
    name: "MariaDBXADS",
    jndiName: "java:/MariaDBXADS",
    xaProperties: {
      Url:
        "jdbc:" +
        mariadbDriver +
        "://" +
        mariadbContainerName +
        "/" +
        mariadbDatabaseName,
    },
  };

  const mariadbDefaultDS = {
    name: "MariaDB",
    jndiName: "java:/MariaDB",
    connectionUrl:
      "jdbc:" +
      mariadbDriver +
      "://" +
      mariadbContainerName +
      "/" +
      mariadbDatabaseName,
  };

  const mariadbDSToAdd = {
    name: "MariaDBDSToAdd",
    jndiName: "java:/MySQLDSToAdd",
    connectionUrl:
      "jdbc:" +
      mariadbDriver +
      "://" +
      mariadbContainerName +
      "/" +
      mariadbDatabaseName,
  };

  const xaMariaDBToAdd = {
    name: "XAMariaDBDSToAdd",
    jndiName: "java:/XAMariaDBDSToAdd",
  };

  let managementEndpoint: string;

  before(() => {
    cy.task("start:mariadb:container", {
      name: mariadbContainerName,
      environmentProperties: {
        MARIADB_USER: mariadbUser,
        MARIADB_PASSWORD: mariadbPassword,
        MARIADB_DATABASE: mariadbDatabaseName,
        MARIADB_ROOT_PASSWORD: "redhat",
      },
    });
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
      cy.executeInWildflyContainer(
        new AddModuleCommandBuilder()
          .withName(mariadbDriverModuleName)
          .withResource(
            "/home/fixtures/jdbc-drivers/mariadb-java-client-3.1.0.jar"
          )
          .withDependencies(["javax.api", "javax.transaction.api"])
          .build()
          .toCLICommand()
      ).then(() => {
        cy.task("execute:cli", {
          managementApi: managementEndpoint + "/management",
          operation: "add",
          address: ["subsystem", "datasources", "jdbc-driver", mariadbDriver],
          "driver-module-name": mariadbDriverModuleName,
          "driver-xa-datasource-class-name":
            "org.mariadb.jdbc.MariaDbDataSource",
        }).then(() => {
          cy.executeInWildflyContainer(
            new AddDataSourceBuilder()
              .withName(mariadbDSToAdd.name)
              .withJndiName(mariadbDSToAdd.jndiName)
              .withConnectionUrl(mariadbDSToAdd.connectionUrl)
              .withDriverName(mariadbDriver)
              .withUsername(mariadbUser)
              .withPassword(mariadbPassword)
              .build()
              .toCLICommand()
          );
          cy.executeInWildflyContainer(
            new AddXADataSourceBuilder()
              .withName(xaMariaDBToAdd.name)
              .withJndiName(xaMariaDBToAdd.jndiName)
              .withUsername(mariadbUser)
              .withPassword(mariadbPassword)
              .withDriverName(mariadbDriver)
              .withXaDataSourceClass("org.mariadb.jdbc.MariaDbDataSource")
              .withXaDataSourceProperty("serverName", mariadbContainerName)
              .withXaDataSourceProperty("databaseName", mariadbDatabaseName)
              .build()
              .toCLICommand()
          );
        });
      });
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Should list created datasources in the column", () => {
    cy.navigateTo(
      managementEndpoint,
      "configuration;path=configuration~subsystems!css~datasources!data-source-driver~datasources"
    );
    cy.get("#ds-configuration li.finder-item").should("have.length", 3);
    cy.get("#non-xa-dsc-" + "ExampleDS".toLowerCase()).should("be.visible");
    cy.get("#non-xa-dsc-" + mariadbDSToAdd.name.toLowerCase()).should(
      "be.visible"
    );
    cy.get("#xa-dsc-" + xaMariaDBToAdd.name.toLowerCase()).should("be.visible");
  });

  it("Test connection", () => {
    const id = "#non-xa-dsc-" + mariadbDSToAdd.name.toLowerCase();
    cy.navigateTo(
      managementEndpoint,
      "configuration;path=configuration~subsystems!css~datasources!data-source-driver~datasources"
    );
    cy.get(id).should("be.visible");
    cy.get(id).click();
    cy.get(id + " button.btn.btn-finder.dropdown-toggle").click();
    cy.get(id + ' a.clickable:contains("Test Connection")').click();
    cy.get(
      'span:contains("Successfully tested connection for data source ' +
        mariadbDSToAdd.name +
        '")'
    ).should("be.visible");
  });

  it("View", () => {
    const id = "#non-xa-dsc-" + mariadbDSToAdd.name.toLowerCase();
    cy.navigateTo(
      managementEndpoint,
      "configuration;path=configuration~subsystems!css~datasources!data-source-driver~datasources"
    );
    cy.get(id).should("be.visible");
    cy.get(id).click();
    cy.get(id + ' a.clickable.btn.btn-finder:contains("View")').click();
    cy.get("#ds-configuration-form-tab-container").should("be.visible");
    cy.url().should((url) => {
      expect(url).to.contain(
        "#data-source-configuration;name=" + mariadbDSToAdd.name
      );
    });
  });

  it("Disable", () => {
    const id = "#non-xa-dsc-" + mariadbDSToAdd.name.toLowerCase();
    cy.navigateTo(
      managementEndpoint,
      "configuration;path=configuration~subsystems!css~datasources!data-source-driver~datasources"
    );
    cy.get(id).should("be.visible");
    cy.get(id).click();
    cy.get(id + " button.btn.btn-finder.dropdown-toggle").click();
    cy.get(id + ' a.clickable:contains("Disable")').click();
    cy.get(
      'span:contains("Data source ' + mariadbDSToAdd.name + ' disabled")'
    ).should("be.visible");
  });

  it("Remove", () => {
    const id = "#non-xa-dsc-" + mariadbDSToAdd.name.toLowerCase();
    cy.navigateTo(
      managementEndpoint,
      "configuration;path=configuration~subsystems!css~datasources!data-source-driver~datasources"
    );
    cy.get(id).should("be.visible");
    cy.get(id).click();
    cy.get(id + " button.btn.btn-finder.dropdown-toggle").click();
    cy.get(id + ' a.clickable:contains("Remove")').click();
    cy.get("#hal-modal button.btn.btn-hal.btn-primary").click();
    cy.get(
      'span:contains("Datasource ' +
        mariadbDSToAdd.name +
        ' successfully removed")'
    ).should("be.visible");
  });

  it("Creates MariaDB datasource via Wizard", () => {
    cy.navigateTo(
      managementEndpoint,
      "configuration;path=configuration~subsystems!css~datasources!data-source-driver~datasources"
    );
    cy.get("#ds-configuration-add-actions").click();
    cy.get("#ds-configuration-add").click({ force: true });
    cy.get("#hal-wizard").should("be.visible");
    cy.get(
      ".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number"
    ).should("have.text", "1");
    cy.get(
      ".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title"
    ).should("have.text", "Choose Template");
    cy.get('.wizard-pf-contents [type="radio"]').check("mariadb");
    cy.get(".modal-footer .btn-primary").click();
    cy.get(
      ".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number"
    ).should("have.text", "2");
    cy.get(
      ".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title"
    ).should("have.text", "Attributes");
    cy.text("ds-configuration-names-form", "name", mariadbDefaultDS.name);
    cy.text(
      "ds-configuration-names-form",
      "jndi-name",
      mariadbDefaultDS.jndiName
    );
    cy.get(".modal-footer .btn-primary").click();
    cy.get(
      ".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number"
    ).should("have.text", "3");
    cy.get(
      ".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title"
    ).should("have.text", "JDBC Driver");
    cy.text("ds-configuration-driver-form", "driver-name", mariadbDriver);
    cy.text(
      "ds-configuration-driver-form",
      "driver-module-name",
      mariadbDriverModuleName
    );
    cy.get(".modal-footer .btn-primary").click();
    cy.get(
      ".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number"
    ).should("have.text", "4");
    cy.get(
      ".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title"
    ).should("have.text", "Connection");
    cy.text(
      "ds-configuration-connection-form",
      "connection-url",
      mariadbDefaultDS.connectionUrl
    );
    cy.text("ds-configuration-connection-form", "user-name", mariadbUser);
    cy.text("ds-configuration-connection-form", "password", mariadbPassword);
    cy.get(".modal-footer .btn-primary").click();
    cy.get(
      ".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number"
    ).should("have.text", "5");
    cy.get(
      ".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title"
    ).should("have.text", "Test Connection");
    cy.get("#ds-configuration-test-connection").click();
    cy.get(".blank-slate-pf-main-action").should(
      "have.text",
      "Test Connection Successful"
    );
    cy.get(".modal-footer .btn-primary").click();
    cy.get(
      ".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number"
    ).should("have.text", "6");
    cy.get(
      ".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title"
    ).should("have.text", "Review");
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".blank-slate-pf-main-action").should(
      "have.text",
      "Operation Successful"
    );
    cy.get(".modal-footer .btn-primary").click();
  });

  it("Creates MariaDB XA datasource via Wizard", () => {
    cy.navigateTo(
      managementEndpoint,
      "configuration;path=configuration~subsystems!css~datasources!data-source-driver~datasources"
    );
    cy.get("#ds-configuration-add-actions").click();
    cy.get("#xa-data-source-add").click({ force: true });
    cy.get("#hal-wizard").should("be.visible");
    cy.get(
      ".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number"
    ).should("have.text", "1");
    cy.get(
      ".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title"
    ).should("have.text", "Choose Template");
    cy.get('.wizard-pf-contents [type="radio"]').check("mariadb-xa");
    cy.get(".modal-footer .btn-primary").click();
    cy.get(
      ".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number"
    ).should("have.text", "2");
    cy.get(
      ".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title"
    ).should("have.text", "Attributes");
    cy.text("ds-configuration-names-form", "name", mariadbDefaultXADS.name);
    cy.text(
      "ds-configuration-names-form",
      "jndi-name",
      mariadbDefaultXADS.jndiName
    );
    cy.get(".modal-footer .btn-primary").click();
    cy.get(
      ".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number"
    ).should("have.text", "3");
    cy.get(
      ".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title"
    ).should("have.text", "JDBC Driver");
    cy.text("ds-configuration-driver-form", "driver-name", mariadbDriver);
    cy.text(
      "ds-configuration-driver-form",
      "driver-module-name",
      mariadbDriverModuleName
    );
    cy.get(".modal-footer .btn-primary").click();
    cy.get(
      ".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number"
    ).should("have.text", "4");
    cy.get(
      ".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title"
    ).should("have.text", "XA Properties");
    cy.get(".tag-manager-container .tm-tag-remove").each(($a) => {
      cy.wrap($a).click();
    });
    Object.entries(mariadbDefaultXADS.xaProperties).forEach(([key, value]) => {
      cy.formInput("ds-configuration-properties-form", "value")
        .clear()
        .type(key + "=" + value + "{enter}")
        .trigger("change");
    });
    cy.get(".tag-manager-container .tm-tag").should(
      "have.length",
      Object.entries(mariadbDefaultXADS.xaProperties).length
    );
    cy.get(".modal-footer .btn-primary").click();
    cy.get(
      ".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number"
    ).should("have.text", "5");
    cy.get(
      ".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title"
    ).should("have.text", "Connection");
    cy.text("ds-configuration-connection-form", "user-name", mariadbUser);
    cy.text("ds-configuration-connection-form", "password", mariadbPassword);
    cy.get(".modal-footer .btn-primary").click();
    cy.get(
      ".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number"
    ).should("have.text", "6");
    cy.get(
      ".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title"
    ).should("have.text", "Test Connection");
    cy.get("#ds-configuration-test-connection").click();
    cy.get(".blank-slate-pf-main-action").should(
      "have.text",
      "Test Connection Successful"
    );
    cy.get(".modal-footer .btn-primary").click();
    cy.get(
      ".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number"
    ).should("have.text", "7");
    cy.get(
      ".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title"
    ).should("have.text", "Review");
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".blank-slate-pf-main-action").should(
      "have.text",
      "Operation Successful"
    );
    cy.get(".modal-footer .btn-primary").click();
  });
});
