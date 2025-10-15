export function buildLocalhostUrl(port: number, path?: string): string {
  const baseUrl = `http://localhost:${port}`;
  return path ? `${baseUrl}${path}` : baseUrl;
}
