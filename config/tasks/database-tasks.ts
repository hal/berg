import { StartedTestContainer } from "testcontainers";
import {
  DEFAULT_POSTGRES_IMAGE,
  DEFAULT_MYSQL_IMAGE,
  DEFAULT_MARIADB_IMAGE,
  DEFAULT_SQLSERVER_IMAGE,
  POSTGRES_PORT,
  MYSQL_PORT,
  MARIADB_PORT,
  SQLSERVER_PORT,
  POSTGRES_STARTED_MSG,
  MYSQL_STARTED_MSG,
  MARIADB_STARTED_MSG,
  SQLSERVER_STARTED_MSG,
} from "../../cypress.config";
import { StartDatabaseContainerParams } from "../interfaces";
import { startDatabaseContainer } from "../containers";

export function createPostgresContainer(startedContainers: Map<string, StartedTestContainer>, networkName: string) {
  return ({ name, environmentProperties }: StartDatabaseContainerParams) => {
    return startDatabaseContainer(
      {
        name,
        image: process.env.POSTGRES_IMAGE || DEFAULT_POSTGRES_IMAGE,
        port: POSTGRES_PORT,
        waitLogMessage: POSTGRES_STARTED_MSG,
        environmentProperties,
        networkName,
        containerMapKey: "postgres",
        successMessage: "PostgreSQL started successfully",
      },
      startedContainers,
    );
  };
}

export function createMysqlContainer(startedContainers: Map<string, StartedTestContainer>, networkName: string) {
  return ({ name, environmentProperties }: StartDatabaseContainerParams) => {
    return startDatabaseContainer(
      {
        name,
        image: process.env.MYSQL_IMAGE || DEFAULT_MYSQL_IMAGE,
        port: MYSQL_PORT,
        waitLogMessage: MYSQL_STARTED_MSG,
        environmentProperties,
        networkName,
        containerMapKey: "mysql",
        successMessage: "MySQL started successfully",
      },
      startedContainers,
    );
  };
}

export function createMariadbContainer(startedContainers: Map<string, StartedTestContainer>, networkName: string) {
  return ({ name, environmentProperties }: StartDatabaseContainerParams) => {
    return startDatabaseContainer(
      {
        name,
        image: process.env.MARIADB_IMAGE || DEFAULT_MARIADB_IMAGE,
        port: MARIADB_PORT,
        waitLogMessage: MARIADB_STARTED_MSG,
        environmentProperties,
        networkName,
        containerMapKey: "mariadb",
        successMessage: "Mariadb started successfully",
      },
      startedContainers,
    );
  };
}

export function createSqlserverContainer(startedContainers: Map<string, StartedTestContainer>, networkName: string) {
  return ({ name, environmentProperties }: StartDatabaseContainerParams) => {
    return startDatabaseContainer(
      {
        name,
        image: process.env.MSSQL_IMAGE || DEFAULT_SQLSERVER_IMAGE,
        port: SQLSERVER_PORT,
        waitLogMessage: SQLSERVER_STARTED_MSG,
        environmentProperties,
        networkName,
        containerMapKey: "sqlserver",
        successMessage: "SQL server started successfully",
      },
      startedContainers,
    );
  };
}
