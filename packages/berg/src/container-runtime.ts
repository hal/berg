import { existsSync } from "fs";
import { execSync } from "child_process";
import os from "os";

function isPodmanHost(dockerHost: string): boolean {
  return dockerHost.includes("podman");
}

function disableTestcontainersRyuk(): void {
  if (!process.env.TESTCONTAINERS_RYUK_DISABLED) {
    process.env.TESTCONTAINERS_RYUK_DISABLED = "true";
  }
}

export function configureContainerRuntime(): void {
  if (process.env.DOCKER_HOST) {
    if (isPodmanHost(process.env.DOCKER_HOST)) {
      disableTestcontainersRyuk();
      console.log(
        `[berg] DOCKER_HOST points to Podman (${process.env.DOCKER_HOST}), configured TESTCONTAINERS_RYUK_DISABLED`,
      );
    }
    return;
  }

  const uid = os.userInfo().uid;
  const podmanSocketPaths = [`/run/user/${uid}/podman/podman.sock`, "/var/run/podman/podman.sock"];

  for (const socketPath of podmanSocketPaths) {
    if (!existsSync(socketPath)) {
      try {
        execSync("systemctl --user start podman.socket", { stdio: "ignore" });
      } catch {
        continue;
      }
    }

    if (existsSync(socketPath)) {
      process.env.DOCKER_HOST = `unix://${socketPath}`;
      disableTestcontainersRyuk();
      console.log(
        `[berg] Detected Podman runtime at ${socketPath}, configured DOCKER_HOST and TESTCONTAINERS_RYUK_DISABLED`,
      );
      return;
    }
  }

  // Verify that at least Docker is available as a fallback
  if (existsSync("/var/run/docker.sock")) {
    return;
  }
}

configureContainerRuntime();
