import { logger } from "./logger";

export function handleContainerError(err: unknown): Error {
  logger.error(err);
  return err instanceof Error ? err : new Error(JSON.stringify(err));
}
