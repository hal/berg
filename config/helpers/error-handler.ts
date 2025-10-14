export function handleContainerError(err: unknown): Error {
  console.log(err);
  return err instanceof Error ? err : new Error(JSON.stringify(err));
}
