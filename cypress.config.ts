import { defineConfig } from "cypress";

export default defineConfig({
  videoCompression: false,
  e2e: {
    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name == 'chrome') {
          launchOptions.args.push('--window-size=1400,1200')
          launchOptions.args.push('--force-device-scale-factor=2')
        }
        if (browser.name == 'firefox') {
          launchOptions.args.push('--width=1400')
          launchOptions.args.push('--height=1200')
        }
        return launchOptions;
      })
    },
  },
});
