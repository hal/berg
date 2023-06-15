import { AddModuleCommandBuilder, AddDataSourceBuilder, AddXADataSourceBuilder } from "@berg/commands";

describe("TESTS: Configuration => Datasource => MySQL (Finder)", () => {
  const mysqlUser = "admin";
  const mysqlPassword = "pass";
  const mysqlDatabaseName = "sampledb";

  const mysqlDriver = "mysql";
  const mysqlDriverModuleName = "com.mysql";
  const mysqlContainerName = "mysql";

  const mysqlDefaultXADS = {
    name: "MysqlXADS",
    jndiName: "java:/MysqlXADS",
    xaProperties: {
      serverName: mysqlContainerName,
      databaseName: mysqlDatabaseName,
    },
  };

  const mysqlDefaultDS = {
    name: "MysqlDS",
    jndiName: "java:/MysqlDS",
    connectionUrl: "jdbc:" + mysqlDriver + "://" + mysqlContainerName + "/" + mysqlDatabaseName,
  };

  const mysqlDSToAdd = {
    name: "MySQLDSToAdd",
    jndiName: "java:/MySQLDSToAdd",
    connectionUrl: "jdbc:" + mysqlDriver + "://" + mysqlContainerName + "/" + mysqlDatabaseName,
  };

  const xaMySQLDSToAdd = {
    name: "XAMySQLDSToAdd",
    jndiName: "java:/XAMySQLDSToAdd",
  };

  let managementEndpoint: string;

  before(() => {
    cy.task(
      "start:mysql:container",
      {
        name: mysqlContainerName,
        environmentProperties: {
          MYSQL_USER: mysqlUser,
          MYSQL_PASSWORD: mysqlPassword,
          MYSQL_DATABASE: mysqlDatabaseName,
          MYSQL_ROOT_PASSWORD: "redhat",
        },
      },
      { timeout: 120_000 }
    );
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
      cy.executeInWildflyContainer(
        new AddModuleCommandBuilder()
          .withName(mysqlDriverModuleName)
          .withResource("/home/fixtures/jdbc-drivers/mysql-connector-j-8.0.31.jar")
          .withDependencies(["javax.api", "javax.transaction.api"])
          .build()
          .toCLICommand()
      ).then(() => {
        cy.task("execute:cli", {
          managementApi: managementEndpoint + "/management",
          operation: "add",
          address: ["subsystem", "datasources", "jdbc-driver", mysqlDriver],
          "driver-module-name": mysqlDriverModuleName,
          "driver-xa-datasource-class-name": "com.mysql.cj.jdbc.MysqlXADataSource",
        }).then(() => {
          cy.executeInWildflyContainer(
            new AddDataSourceBuilder()
              .withName(mysqlDSToAdd.name)
              .withJndiName(mysqlDSToAdd.jndiName)
              .withConnectionUrl(mysqlDSToAdd.connectionUrl)
              .withDriverName(mysqlDriver)
              .withUsername(mysqlUser)
              .withPassword(mysqlPassword)
              .build()
              .toCLICommand()
          );
          cy.executeInWildflyContainer(
            new AddXADataSourceBuilder()
              .withName(xaMySQLDSToAdd.name)
              .withJndiName(xaMySQLDSToAdd.jndiName)
              .withUsername(mysqlUser)
              .withPassword(mysqlPassword)
              .withDriverName(mysqlDriver)
              .withXaDataSourceClass("com.mysql.cj.jdbc.MysqlXADataSource")
              .withXaDataSourceProperty("serverName", mysqlContainerName)
              .withXaDataSourceProperty("databaseName", mysqlDatabaseName)
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
    cy.get("#non-xa-dsc-" + mysqlDSToAdd.name.toLowerCase()).should("be.visible");
    cy.get("#xa-dsc-" + xaMySQLDSToAdd.name.toLowerCase()).should("be.visible");
  });

  it("Test connection", () => {
    const id = "#non-xa-dsc-" + mysqlDSToAdd.name.toLowerCase();
    cy.navigateTo(
      managementEndpoint,
      "configuration;path=configuration~subsystems!css~datasources!data-source-driver~datasources"
    );
    cy.get(id).should("be.visible");
    cy.get(id).click();
    cy.get(id + " button.btn.btn-finder.dropdown-toggle").click();
    cy.get(id + ' a.clickable:contains("Test Connection")').click();
    cy.get('span:contains("Successfully tested connection for data source ' + mysqlDSToAdd.name + '")').should(
      "be.visible"
    );
  });

  it("View", () => {
    const id = "#non-xa-dsc-" + mysqlDSToAdd.name.toLowerCase();
    cy.navigateTo(
      managementEndpoint,
      "configuration;path=configuration~subsystems!css~datasources!data-source-driver~datasources"
    );
    cy.get(id).should("be.visible");
    cy.get(id).click();
    cy.get(id + ' a.clickable.btn.btn-finder:contains("View")').click();
    cy.get("#ds-configuration-form-tab-container").should("be.visible");
    cy.url().should((url) => {
      expect(url).to.contain("#data-source-configuration;name=" + mysqlDSToAdd.name);
    });
  });

  it("Disable", () => {
    const id = "#non-xa-dsc-" + mysqlDSToAdd.name.toLowerCase();
    cy.navigateTo(
      managementEndpoint,
      "configuration;path=configuration~subsystems!css~datasources!data-source-driver~datasources"
    );
    cy.get(id).should("be.visible");
    cy.get(id).click();
    cy.get(id + " button.btn.btn-finder.dropdown-toggle").click();
    cy.get(id + ' a.clickable:contains("Disable")').click();
    cy.get('span:contains("Data source ' + mysqlDSToAdd.name + ' disabled")').should("be.visible");
  });

  it("Remove", () => {
    const id = "#non-xa-dsc-" + mysqlDSToAdd.name.toLowerCase();
    cy.navigateTo(
      managementEndpoint,
      "configuration;path=configuration~subsystems!css~datasources!data-source-driver~datasources"
    );
    cy.get(id).should("be.visible");
    cy.get(id).click();
    cy.get(id + " button.btn.btn-finder.dropdown-toggle").click();
    cy.get(id + ' a.clickable:contains("Remove")').click();
    cy.get("#hal-modal button.btn.btn-hal.btn-primary").click();
    cy.get('span:contains("Datasource ' + mysqlDSToAdd.name + ' successfully removed")').should("be.visible");
  });

  it("Creates MySQL datasource via Wizard", () => {
    cy.navigateTo(
      managementEndpoint,
      "configuration;path=configuration~subsystems!css~datasources!data-source-driver~datasources"
    );
    cy.get("#ds-configuration-add-actions").click();
    cy.get("#ds-configuration-add").click({ force: true });
    cy.get("#hal-wizard").should("be.visible");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "1");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "Choose Template");
    cy.get('.wizard-pf-contents [type="radio"]').check("mysql");
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "2");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "Attributes");
    cy.text("ds-configuration-names-form", "name", mysqlDefaultDS.name);
    cy.text("ds-configuration-names-form", "jndi-name", mysqlDefaultDS.jndiName);
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "3");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "JDBC Driver");
    cy.text("ds-configuration-driver-form", "driver-name", mysqlDriver);
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "4");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "Connection");
    cy.text("ds-configuration-connection-form", "connection-url", mysqlDefaultDS.connectionUrl);
    cy.text("ds-configuration-connection-form", "user-name", mysqlUser);
    cy.text("ds-configuration-connection-form", "password", mysqlPassword);
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

  it("Creates MySQL XA datasource via Wizard", () => {
    cy.navigateTo(
      managementEndpoint,
      "configuration;path=configuration~subsystems!css~datasources!data-source-driver~datasources"
    );
    cy.get("#ds-configuration-add-actions").click();
    cy.get("#xa-data-source-add").click({ force: true });
    cy.get("#hal-wizard").should("be.visible");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "1");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "Choose Template");
    cy.get('.wizard-pf-contents [type="radio"]').check("mysql-xa");
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "2");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "Attributes");
    cy.text("ds-configuration-names-form", "name", mysqlDefaultXADS.name);
    cy.text("ds-configuration-names-form", "jndi-name", mysqlDefaultXADS.jndiName);
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "3");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "JDBC Driver");
    cy.text("ds-configuration-driver-form", "driver-name", mysqlDriver);
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "4");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "XA Properties");
    cy.get(".tag-manager-container .tm-tag-remove").each(($a) => {
      cy.wrap($a).click();
    });
    Object.entries(mysqlDefaultXADS.xaProperties).forEach(([key, value]) => {
      cy.formInput("ds-configuration-properties-form", "value")
        .clear()
        .type(key + "=" + value + "{enter}")
        .trigger("change");
    });
    cy.get(".tag-manager-container .tm-tag").should(
      "have.length",
      Object.entries(mysqlDefaultXADS.xaProperties).length
    );
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "5");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "Connection");
    cy.text("ds-configuration-connection-form", "user-name", mysqlUser);
    cy.text("ds-configuration-connection-form", "password", mysqlPassword);
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
