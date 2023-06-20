import { AddDataSourceBuilder, AddModuleCommandBuilder, AddXADataSourceBuilder } from "@berg/commands";

describe("TESTS: Configuration => Datasource => SQL Server (Finder)", () => {
  const sqlserverUser = "sa";
  const sqlserverPassword = "Str[0]ngPassw[0]rd";
  const sqlserverDatabaseName = "tempdb";

  const sqlserverDriverName = "sqlserver";
  const sqlserverDriverModuleName = "com.micrososoft";
  const sqlserverContainerName = "sqlserver";

  const slqserverDefaultDS = {
    name: "MSSQLDS",
    jndiName: "java:/MSSQLDS",
    connectionUrl:
      "jdbc:" +
      sqlserverDriverName +
      "://" +
      sqlserverContainerName +
      ";DatabaseName=" +
      sqlserverDatabaseName +
      ";encrypt=true;trustServerCertificate=true",
  };

  const sqlserverDefaultXADS = {
    name: "MSSQLXADS",
    jndiName: "java:/MSSQLXADS",
    xaProperties: {
      serverName: sqlserverContainerName,
      databaseName: sqlserverDatabaseName,
      encrypt: "true",
      trustServerCertificate: "true",
    },
  };

  const sqlserverDSToAdd = {
    name: "SqlserverToAddDS",
    jndiName: "java:/SqlserverToAddDS",
    connectionUrl:
      "jdbc:" +
      sqlserverDriverName +
      "://" +
      sqlserverContainerName +
      ";DatabaseName=" +
      sqlserverDatabaseName +
      ";encrypt=true;trustServerCertificate=true",
  };

  const xaSqlserverDSToAdd = {
    name: "XAPostgreDSToAdd",
    jndiName: "java:/XAPostgreDSToAdd",
  };

  let managementEndpoint: string;

  before(() => {
    cy.task(
      "start:sqlserver:container",
      {
        name: "sqlserver",
        environmentProperties: {
          ACCEPT_EULA: "Y",
          MSSQL_SA_PASSWORD: sqlserverPassword,
        },
      },
      { timeout: 360_000 }
    );
    cy.startWildflyContainer()
      .then((result) => {
        managementEndpoint = result as string;
      })
      .then(() => {
        cy.executeInWildflyContainer(
          new AddModuleCommandBuilder()
            .withName(sqlserverDriverModuleName)
            .withResource("/home/fixtures/jdbc-drivers/mssql-jdbc-11.2.1.jre11.jar")
            .withDependencies(["javax.api", "javax.transaction.api"])
            .build()
            .toCLICommand()
        );
      })
      .then(() => {
        cy.task("execute:cli", {
          managementApi: managementEndpoint + "/management",
          operation: "add",
          address: ["subsystem", "datasources", "jdbc-driver", sqlserverDriverName],
          "driver-module-name": sqlserverDriverModuleName,
          "driver-xa-datasource-class-name": "com.microsoft.sqlserver.jdbc.SQLServerXADataSource",
        }).then(() => {
          cy.executeInWildflyContainer(
            new AddDataSourceBuilder()
              .withName(sqlserverDSToAdd.name)
              .withJndiName(sqlserverDSToAdd.jndiName)
              .withConnectionUrl(sqlserverDSToAdd.connectionUrl)
              .withDriverName(sqlserverDriverName)
              .withUsername(sqlserverUser)
              .withPassword(sqlserverPassword)
              .build()
              .toCLICommand()
          );
          cy.executeInWildflyContainer(
            new AddXADataSourceBuilder()
              .withName(xaSqlserverDSToAdd.name)
              .withJndiName(xaSqlserverDSToAdd.jndiName)
              .withUsername(sqlserverUser)
              .withPassword(sqlserverPassword)
              .withDriverName(sqlserverDriverName)
              .withXaDataSourceClass("com.microsoft.sqlserver.jdbc.SQLServerXADataSource")
              .withXaDataSourceProperty("serverName", sqlserverContainerName)
              .withXaDataSourceProperty("databaseName", sqlserverDatabaseName)
              .withXaDataSourceProperty("encrypt", "true")
              .withXaDataSourceProperty("trustServerCertificate", "true")
              .build()
              .toCLICommand()
          );
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
    cy.get("#non-xa-dsc-" + sqlserverDSToAdd.name.toLowerCase()).should("be.visible");
    cy.get("#xa-dsc-" + xaSqlserverDSToAdd.name.toLowerCase()).should("be.visible");
  });

  it("Test connection", () => {
    const id = "#non-xa-dsc-" + sqlserverDSToAdd.name.toLowerCase();
    cy.navigateTo(
      managementEndpoint,
      "configuration;path=configuration~subsystems!css~datasources!data-source-driver~datasources"
    );
    cy.get(id).should("be.visible");
    cy.get(id).click();
    cy.get(id + " button.btn.btn-finder.dropdown-toggle").click();
    cy.get(id + ' a.clickable:contains("Test Connection")').click();
    cy.get('span:contains("Successfully tested connection for data source ' + sqlserverDSToAdd.name + '")').should(
      "be.visible"
    );
  });

  it("View", () => {
    const id = "#non-xa-dsc-" + sqlserverDSToAdd.name.toLowerCase();
    cy.navigateTo(
      managementEndpoint,
      "configuration;path=configuration~subsystems!css~datasources!data-source-driver~datasources"
    );
    cy.get(id).should("be.visible");
    cy.get(id).click();
    cy.get(id + ' a.clickable.btn.btn-finder:contains("View")').click();
    cy.get("#ds-configuration-form-tab-container").should("be.visible");
    cy.url().should((url) => {
      expect(url).to.contain("#data-source-configuration;name=" + sqlserverDSToAdd.name);
    });
  });

  it("Disable", () => {
    const id = "#non-xa-dsc-" + sqlserverDSToAdd.name.toLowerCase();
    cy.navigateTo(
      managementEndpoint,
      "configuration;path=configuration~subsystems!css~datasources!data-source-driver~datasources"
    );
    cy.get(id).should("be.visible");
    cy.get(id).click();
    cy.get(id + " button.btn.btn-finder.dropdown-toggle").click();
    cy.get(id + ' a.clickable:contains("Disable")').click();
    cy.get('span:contains("Data source ' + sqlserverDSToAdd.name + ' disabled")').should("be.visible");
  });

  it("Remove", () => {
    const id = "#non-xa-dsc-" + sqlserverDSToAdd.name.toLowerCase();
    cy.navigateTo(
      managementEndpoint,
      "configuration;path=configuration~subsystems!css~datasources!data-source-driver~datasources"
    );
    cy.get(id).should("be.visible");
    cy.get(id).click();
    cy.get(id + " button.btn.btn-finder.dropdown-toggle").click();
    cy.get(id + ' a.clickable:contains("Remove")').click();
    cy.get("#hal-modal button.btn.btn-hal.btn-primary").click();
    cy.get('span:contains("Datasource ' + sqlserverDSToAdd.name + ' successfully removed")').should("be.visible");
  });

  it("Creates SQLServer datasource via Wizard", () => {
    cy.navigateTo(
      managementEndpoint,
      "configuration;path=configuration~subsystems!css~datasources!data-source-driver~datasources"
    );
    cy.get("#ds-configuration-add-actions").click();
    cy.get("#ds-configuration-add").click({ force: true });
    cy.get("#hal-wizard").should("be.visible");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "1");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "Choose Template");
    cy.get('.wizard-pf-contents [type="radio"]').check("sqlserver");
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "2");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "Attributes");
    cy.text("ds-configuration-names-form", "name", slqserverDefaultDS.name);
    cy.text("ds-configuration-names-form", "jndi-name", slqserverDefaultDS.jndiName);
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "3");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "JDBC Driver");
    cy.text("ds-configuration-driver-form", "driver-name", sqlserverDriverName);
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "4");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "Connection");
    cy.text("ds-configuration-connection-form", "connection-url", slqserverDefaultDS.connectionUrl);
    cy.text("ds-configuration-connection-form", "user-name", sqlserverUser);
    cy.text("ds-configuration-connection-form", "password", sqlserverPassword.replace("{", "{{}"));
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "5");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "Test Connection");
    cy.get("#ds-configuration-test-connection").click();
    cy.get(".blank-slate-pf-main-action").should("have.text", "Test Connection Successful");
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "6");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "Review");
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".blank-slate-pf-main-action").should("have.text", "Operation Successful");
    cy.get(".modal-footer .btn-primary").click();
  });

  it("Creates SQLServer XA datasource via Wizard", () => {
    cy.navigateTo(
      managementEndpoint,
      "configuration;path=configuration~subsystems!css~datasources!data-source-driver~datasources"
    );
    cy.get("#ds-configuration-add-actions").click();
    cy.get("#xa-data-source-add").click({ force: true });
    cy.get("#hal-wizard").should("be.visible");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "1");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "Choose Template");
    cy.get('.wizard-pf-contents [type="radio"]').check("sqlserver-xa");
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "2");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "Attributes");
    cy.text("ds-configuration-names-form", "name", sqlserverDefaultXADS.name);
    cy.text("ds-configuration-names-form", "jndi-name", sqlserverDefaultXADS.jndiName);
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "3");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "JDBC Driver");
    cy.text("ds-configuration-driver-form", "driver-name", sqlserverDriverName);
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "4");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "XA Properties");
    cy.get(".tag-manager-container .tm-tag-remove").each(($a) => {
      cy.wrap($a).click();
    });
    Object.entries(sqlserverDefaultXADS.xaProperties).forEach(([key, value]) => {
      cy.formInput("ds-configuration-properties-form", "value")
        .clear()
        .type(key + "=" + value + "{enter}")
        .trigger("change");
    });
    cy.get(".tag-manager-container .tm-tag").should(
      "have.length",
      Object.entries(sqlserverDefaultXADS.xaProperties).length
    );
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "5");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "Connection");
    cy.text("ds-configuration-connection-form", "user-name", sqlserverUser);
    cy.text("ds-configuration-connection-form", "password", sqlserverPassword);
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "6");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "Test Connection");
    cy.get("#ds-configuration-test-connection").click();
    cy.get(".blank-slate-pf-main-action").should("have.text", "Test Connection Successful");
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "7");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "Review");
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".blank-slate-pf-main-action").should("have.text", "Operation Successful");
    cy.get(".modal-footer .btn-primary").click();
  });
});
