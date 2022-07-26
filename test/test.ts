import {
    GenericContainer,
    StartedTestContainer,
    TestContainer,
    Wait
} from 'testcontainers';

import { expect } from 'chai';

describe('Initial test', () => {

    let container: StartedTestContainer;

    it('should start', async () => {
        let halContainer = new GenericContainer('quay.io/halconsole/wildfly')
            .withExposedPorts({container: 9990, host: 9990 })
            .withStartupTimeout(333000)
            .withWaitStrategy(Wait.forLogMessage(new RegExp(".*WildFly Full.*started in.*")))
            .withCmd(["-c", "standalone-insecure.xml"])
            .withReuse();
        container = await halContainer.start();
        expect(container).to.not.be.undefined;
    })

    after('Cleanup resources', async () => {
        await container.stop()
    })
})