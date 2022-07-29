import { defineConfig } from "cypress";
import {
  GenericContainer,
  StartedTestContainer,
  Wait
} from 'testcontainers';

const halContainer = new GenericContainer('quay.io/halconsole/wildfly')
            .withExposedPorts({container: 9990, host: 9990 })
            .withStartupTimeout(333000)
            .withWaitStrategy(Wait.forLogMessage(new RegExp(".*WildFly Full.*started in.*")))
            .withCmd(["-c", "standalone-insecure.xml"])
            .withReuse()
let startedHalContainer: StartedTestContainer;

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
      on('task',  {
        async "start:container"() {
          startedHalContainer =  await halContainer.start();
          return startedHalContainer
        },
        async "stop:container"() {
          return await startedHalContainer.stop()
        }
      })
    },
  },
});
