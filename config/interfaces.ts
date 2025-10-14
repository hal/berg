import { Environment } from "testcontainers/build/types";

export interface DatabaseConfig {
  name: string;
  image: string;
  port: number;
  waitLogMessage: string;
  environmentProperties: Environment;
  networkName: string;
  containerMapKey: string;
  successMessage: string;
}

export interface WildflyManagementResponse {
  data: {
    result: string;
  };
}

export interface AxiosErrorResponse {
  response: {
    data: string;
  };
}

export interface StartWildflyContainerParams {
  name: string;
  configuration: string;
  useNetworkHostMode?: boolean;
}

export interface StartKeycloakContainerParams {
  name: string;
}

export interface StartDatabaseContainerParams {
  name: string;
  environmentProperties: Environment;
}

export interface ExecuteInContainerParams {
  containerName: string;
  command: string;
}

export interface ExecuteCliParams {
  managementApi: string;
  operation: string;
  address: string[];
  [key: string]: unknown;
}
