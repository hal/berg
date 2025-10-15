import { hostname } from "os";
import { WILDFLY_MANAGEMENT_PORT, LOCALHOST_IP } from "../../cypress.config";

export function calculateManagementPort(portOffset: number): number {
  return portOffset + WILDFLY_MANAGEMENT_PORT;
}

export function getHostnameMapping(): Array<{ host: string; ipAddress: string }> {
  return [{ host: hostname(), ipAddress: LOCALHOST_IP }];
}

export function buildKeycloakStartCommand(port: number): string[] {
  return ["start-dev", "--db=dev-mem", `--http-port=${port.toString()}`, "--import-realm"];
}
