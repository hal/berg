const isVerbose = process.env.BERG_VERBOSE === "true";

export const logger = {
  error: (...args: unknown[]) => console.error("[berg]", ...args),
  info: (...args: unknown[]) => console.log("[berg]", ...args),
  debug: (...args: unknown[]) => {
    if (isVerbose) console.log("[berg:debug]", ...args);
  },
};
